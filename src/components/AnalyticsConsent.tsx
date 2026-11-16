import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Settings2, X } from 'lucide-react';
import './analytics-consent.css';

type Consent = 'unset' | 'granted' | 'denied';
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

const STORAGE_KEY = 'anil-analytics.analytics-consent';
const SCRIPT_ID = 'anil-analytics-optional-ga4';
const requestedId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim().toUpperCase();
const measurementId = /^G-[A-Z0-9]{4,20}$/.test(requestedId) ? requestedId : '';
const initializedIds = new Set<string>();

function readConsent(): Consent {
  if (!measurementId || typeof window === 'undefined') return 'unset';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unset';
  } catch {
    return 'unset';
  }
}

function saveConsent(consent: Exclude<Consent, 'unset'>) {
  try { window.localStorage.setItem(STORAGE_KEY, consent); } catch { /* The choice still applies for this page session. */ }
}

function clearAnalyticsCookies(id: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const names = ['_ga', `_ga_${id.slice(2)}`];
  const host = window.location.hostname;
  const segments = host.split('.');
  const domains = new Set<string>([host]);
  for (let index = 1; index < segments.length - 1; index += 1) domains.add(segments.slice(index).join('.'));
  for (const name of names) {
    const expired = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
    try {
      document.cookie = expired;
      for (const domain of domains) {
        document.cookie = `${expired}; Domain=${domain}`;
        document.cookie = `${expired}; Domain=.${domain}`;
      }
    } catch { /* Cookie storage may be blocked by the browser. */ }
  }
}

function disableAnalytics(id: string) {
  if (typeof window === 'undefined') return;
  (window as unknown as AnalyticsWindow)[`ga-disable-${id}`] = true;
  clearAnalyticsCookies(id);
}

function enableAnalytics(id: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const analyticsWindow = window as unknown as AnalyticsWindow;
  analyticsWindow[`ga-disable-${id}`] = false;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  if (!analyticsWindow.gtag) {
    analyticsWindow.gtag = function (..._args: unknown[]) {
      analyticsWindow.dataLayer?.push(arguments);
    };
  }
  if (!initializedIds.has(id)) {
    // Configure the GA4 web stream with Enhanced Measurement disabled. This
    // application deliberately sends only the explicit page_view events below.
    analyticsWindow.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    analyticsWindow.gtag('js', new Date());
    analyticsWindow.gtag('config', id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: `${window.location.origin}${window.location.pathname}`,
      page_referrer: '',
      cookie_flags: 'SameSite=Lax;Secure',
    });
    initializedIds.add(id);
  }
  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }
}

export default function AnalyticsConsent() {
  const { pathname } = useLocation();
  const [consent, setConsent] = useState<Consent>(readConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastTrackedPath = useRef<string | null>(null);
  const bannerRef = useRef<HTMLElement>(null);
  const manageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;
    if (consent === 'granted') enableAnalytics(measurementId);
    else {
      disableAnalytics(measurementId);
      lastTrackedPath.current = null;
    }
  }, [consent]);

  useEffect(() => {
    if (!measurementId || consent !== 'granted' || typeof window === 'undefined') return;
    if (lastTrackedPath.current === pathname) return;
    const analyticsWindow = window as unknown as AnalyticsWindow;
    if (analyticsWindow[`ga-disable-${measurementId}`] || !analyticsWindow.gtag) return;
    const cleanLocation = `${window.location.origin}${window.location.pathname}`;
    analyticsWindow.gtag('set', { page_location: cleanLocation, page_referrer: '' });
    analyticsWindow.gtag('event', 'page_view', {
      send_to: measurementId,
      page_location: cleanLocation,
      page_path: window.location.pathname,
      page_title: document.title,
      page_referrer: '',
    });
    lastTrackedPath.current = pathname;
  }, [pathname, consent]);

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;
    const syncConsent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) setConsent(readConsent());
    };
    window.addEventListener('storage', syncConsent);
    return () => window.removeEventListener('storage', syncConsent);
  }, []);

  useEffect(() => {
    if (settingsOpen) bannerRef.current?.focus();
  }, [settingsOpen]);

  if (!measurementId) return null;

  const makeChoice = (choice: Exclude<Consent, 'unset'>) => {
    if (choice === 'denied') disableAnalytics(measurementId);
    saveConsent(choice);
    setConsent(choice);
    setSettingsOpen(false);
    window.setTimeout(() => manageRef.current?.focus(), 0);
  };
  const closeSettings = () => { setSettingsOpen(false); window.setTimeout(() => manageRef.current?.focus(), 0); };

  return <>
    {consent !== 'unset' && !settingsOpen && <button ref={manageRef} type="button" className="analytics-privacy-control" onClick={() => setSettingsOpen(true)} aria-label="Manage optional analytics privacy settings"><Settings2 size={13} />Privacy settings</button>}
    {(consent === 'unset' || settingsOpen) && <section ref={bannerRef} className="analytics-consent-panel" tabIndex={-1} aria-labelledby="analytics-consent-title" onKeyDown={event => { if (event.key === 'Escape' && consent !== 'unset') closeSettings(); }}>
      <div className="analytics-consent-heading"><BarChart3 size={19} /><h2 id="analytics-consent-title">A little insight, with your permission.</h2>{consent !== 'unset' && <button type="button" onClick={closeSettings} className="analytics-consent-close" aria-label="Close analytics settings"><X size={16} /></button>}</div>
      <p>Google Analytics is optional. Allow page-visit measurement to help improve this website, or continue without it. Your choice is saved in this browser.</p>
      {consent === 'granted' && <p className="analytics-consent-status">Analytics is currently allowed. Withdrawing stops future tracking and clears this site’s Google Analytics cookies.</p>}
      <div className="analytics-consent-actions"><button type="button" onClick={() => makeChoice('granted')} className="analytics-allow">{consent === 'granted' ? 'Keep analytics allowed' : 'Allow analytics'}</button><button type="button" onClick={() => makeChoice('denied')} className="analytics-decline">{consent === 'granted' ? 'Withdraw consent' : 'Continue without'}</button></div>
      <Link className="analytics-privacy-link" to="/privacy">Read the Privacy Policy</Link>
    </section>}
  </>;
}
