import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './App';
import Home from './pages/Home';
import { ServicesPage, ProjectsPage, ProjectDetailPage, AboutPage, ProcessPage, PricingPage, ContactPage, PrivacyPage, TermsPage, NotFoundPage } from './pages/Pages';
import { projects } from './data/content';
import { siteConfig } from './config';

export const projectMetadata = projects.map(p => ({ path: `/projects/${p.slug}`, title: `${p.title} | Data With Anil`, description: p.description }));
export const buildBasePath = siteConfig.basePath;
export const buildStaticHosting = siteConfig.staticHosting;
export function render(path: string) {
  return renderToString(<StaticRouter basename={siteConfig.routerBase} location={`${siteConfig.basePath}${path.replace(/^\//, '')}`}><a className="skip-link" href="#main-content">Skip to content</a><Header/><main id="main-content" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/><Route path="/services" element={<ServicesPage/>}/><Route path="/projects" element={<ProjectsPage/>}/><Route path="/projects/:slug" element={<ProjectDetailPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/process" element={<ProcessPage/>}/><Route path="/pricing" element={<PricingPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/privacy" element={<PrivacyPage/>}/><Route path="/terms" element={<TermsPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></main><Footer/></StaticRouter>);
}
