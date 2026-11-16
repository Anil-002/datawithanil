import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, ArrowUp, Mail } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import Home from './pages/Home';
import { siteConfig } from './config';
import { projects } from './data/content';
import AnalyticsConsent from './components/AnalyticsConsent';

const loadPage = (name: string) => lazy(() => import('./pages/Pages').then(module => ({ default: (module as any)[name] })));
const Services = loadPage('ServicesPage'), Projects = loadPage('ProjectsPage'), ProjectDetails = loadPage('ProjectDetailPage'), About = loadPage('AboutPage'), Process = loadPage('ProcessPage'), Pricing = loadPage('PricingPage'), Contact = loadPage('ContactPage'), Privacy = loadPage('PrivacyPage'), Terms = loadPage('TermsPage'), NotFound = loadPage('NotFoundPage');

export function Brand() {
  return <Link to="/" className="brand" aria-label="Data With Anil home"><span className="brand-icon" aria-hidden="true"><i/><i/><i/></span><span>DATA<span className="brand-light"> WITH ANIL</span><small>TURNING DATA INTO DECISIONS</small></span></Link>;
}

const titles: Record<string, [string, string]> = {
  '/': ['Data With Anil | Power BI Dashboards, Data Analytics & Automation', 'Independent data analytics and business intelligence consulting by Anil Singh. Power BI dashboards, Excel automation, SQL, and practical business insights.'],
  '/services': ['Data Analytics Services | Power BI & Excel Automation', 'Build better dashboards, simplify spreadsheets, and make data useful with independent analytics consulting.'],
  '/projects': ['Data Analytics Portfolio | Power BI & Business Intelligence Projects', 'Explore six Power BI projects across food and beverage inventory, FMCG delivery, quick commerce, workforce retention, healthcare claims, and HR.'],
  '/about': ['About Anil | Data Analyst & BI Consultant', 'Meet Anil Singh, an independent data analytics and business intelligence consultant with an engineering background.'],
  '/process': ['How I Work | Data With Anil', 'A clear five-step process from understanding your business problem to validated dashboards and documented handover.'],
  '/pricing': ['Analytics Consulting Pricing | Data With Anil', 'Explore starting estimates for Excel automation, Power BI dashboards, and complete analytics solutions.'],
  '/contact': ['Contact Data With Anil | Start Your Data Analytics Project', 'Tell Anil about your reporting challenge, dashboard project, or Excel workflow.'],
  '/privacy': ['Privacy Policy | Data With Anil', 'How Data With Anil handles project inquiries and personal information.'],
  '/terms': ['Terms & Conditions | Data With Anil', 'Website terms, project estimates, demonstration content, and consulting engagements.'],
};

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const project = projects.find(p => pathname === `/projects/${p.slug}`);
    const [title, description] = titles[pathname] || (project ? [`${project.title} | Data With Anil`, project.description] : ['Page Not Found | Data With Anil', 'Explore practical business intelligence and data analytics with Data With Anil.']);
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    if (siteConfig.domain) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.append(canonical); }
      canonical.setAttribute('href', siteConfig.domain + pathname);
    }
    const main = document.querySelector<HTMLElement>('main');
    main?.focus({ preventScroll: true });
    if (hash) {
      const scrollToAnchor = () => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!target) return false;
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        return true;
      };
      if (scrollToAnchor()) return;
      const observer = new MutationObserver(() => { if (scrollToAnchor()) observer.disconnect(); });
      observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
      const timeout = window.setTimeout(() => observer.disconnect(), 5000);
      return () => { observer.disconnect(); window.clearTimeout(timeout); };
    }
  }, [pathname, hash]);
  return null;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape);
  }, []);
  return <header className={`site-header ${scrolled ? 'scrolled' : ''}`}><div className="container header-inner">
    <Brand />
    <nav id="main-navigation" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
      {[['/', 'Home'], ['/services', 'Services'], ['/projects', 'Projects'], ['/about', 'About'], ['/process', 'Process']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
      <Link className="mobile-contact" to="/contact">Contact <ArrowUpRight size={15}/></Link>
    </nav>
    <Link className="button button-outline nav-cta" to="/contact">Let's work together <ArrowUpRight size={17}/></Link>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </div></header>;
}

export function CTASection() {
  return <section className="closing-cta"><div className="container closing-inner"><div><p className="eyebrow">GOOD DECISIONS START WITH A CONVERSATION</p><h2>Your business has data.<br/>Let's make it <em>work smarter.</em></h2></div><Link className="round-cta" to="/contact" aria-label="Discuss your data analytics project"><ArrowUpRight size={45}/><span>Let's talk</span></Link></div></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Brand/><p>Clearer insights. Simpler reporting.<br/>Better business decisions.</p><a className="footer-email" href={`mailto:${siteConfig.email}`}><Mail size={16}/>{siteConfig.email}</a></div><div><h3>Explore</h3><Link to="/about">About Anil</Link><Link to="/projects">Selected work</Link><Link to="/process">How I work</Link><Link to="/pricing">Pricing</Link></div><div><h3>What I do</h3><Link to="/services#power-bi">Power BI dashboards</Link><Link to="/services#excel-automation">Excel automation</Link><Link to="/services#data-analysis">Data analysis</Link><Link to="/services#sql-reporting">SQL & reporting</Link></div><div className="footer-note"><span className="status-dot"/><span>Based in India.<br/>Working with businesses<br/>across the world.</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Data With Anil. All rights reserved.</span><div><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & conditions</Link><button onClick={() => window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>Back to top <ArrowUp size={14}/></button></div></div></div></footer>;
}

export default function App() {
  return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main-content">Skip to content</a><Header/><RouteEffects/><main id="main-content" tabIndex={-1}><Suspense fallback={<div className="container loading-page" role="status">Loading your next perspective…</div>}><Routes><Route path="/" element={<Home/>}/><Route path="/services" element={<Services/>}/><Route path="/projects" element={<Projects/>}/><Route path="/projects/:slug" element={<ProjectDetails/>}/><Route path="/about" element={<About/>}/><Route path="/process" element={<Process/>}/><Route path="/pricing" element={<Pricing/>}/><Route path="/contact" element={<Contact/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/terms" element={<Terms/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense></main><Footer/><AnalyticsConsent/></MotionConfig>;
}
