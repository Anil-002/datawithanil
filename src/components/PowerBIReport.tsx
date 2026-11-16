import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { getPublicEmbedUrl, getReportOpenUrl, type PowerBIReportConfig } from '../data/powerBIReports';
import './power-bi-report.css';

export function PowerBIReportLink({ report }: { report?: PowerBIReportConfig }) {
  const href = getReportOpenUrl(report);
  if (!href) return null;
  return <div className="power-bi-open-report"><a className="text-link" href={href} target="_blank" rel="noopener noreferrer">Open published report <ArrowUpRight size={16} /></a>{!getPublicEmbedUrl(report) && <span>Microsoft sign-in and report access may be required.</span>}</div>;
}

export default function PowerBIReport({ report, title, expanded = false }: { report: PowerBIReportConfig; title: string; expanded?: boolean }) {
  const embedUrl = getPublicEmbedUrl(report);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [reload, setReload] = useState(0);
  const loadTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    setFrameLoaded(false);
    setShowHelp(false);
    loadTimeout.current = window.setTimeout(() => setShowHelp(true), 20000);
    return () => window.clearTimeout(loadTimeout.current);
  }, [embedUrl, reload]);

  const finishLoading = () => {
    window.clearTimeout(loadTimeout.current);
    setFrameLoaded(true);
  };

  if (!embedUrl) return <PowerBIReportLink report={report} />;

  return <div className={`power-bi-report${expanded ? ' power-bi-report-expanded' : ''}`}>
    <div className="power-bi-report-toolbar"><p>Use the report’s page navigation and filters to explore.</p><PowerBIReportLink report={report} /></div>
    <div className="power-bi-report-viewport">
      {!frameLoaded && <div className="power-bi-report-loading" role="status"><span aria-hidden="true" />Loading Power BI report…</div>}
      <iframe key={`${embedUrl}-${reload}`} src={embedUrl} title={`${title} — interactive Power BI report`} loading={expanded ? 'eager' : 'lazy'} allow="fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={finishLoading} onError={() => { finishLoading(); setShowHelp(true); }} />
    </div>
    {showHelp && <div className="power-bi-report-help"><p>If the report does not appear, open it in a new tab or reload the embedded view.</p><button type="button" onClick={() => setReload(value => value + 1)}><RotateCcw size={14} />Reload report</button></div>}
  </div>;
}
