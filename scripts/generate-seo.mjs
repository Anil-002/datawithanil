import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, projectMetadata, buildBasePath } from '../.prerender/prerender.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['.env.production.local', '.env.production', '.env.local', '.env']) {
  try { process.loadEnvFile(path.join(root, file)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const site = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').replace(/\/$/, '');
if (site) {
  const parsedSite = new URL(site);
  if (parsedSite.protocol !== 'https:' || parsedSite.username || parsedSite.password || parsedSite.search || parsedSite.hash) throw new Error('VITE_SITE_URL must be an HTTPS site URL, optionally with the hosting base path, without credentials, query, or hash.');
  if (parsedSite.pathname.replace(/\/$/, '') !== buildBasePath.replace(/\/$/, '')) throw new Error('The path in VITE_SITE_URL must match VITE_BASE_PATH.');
}
const escape = (s) => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const staticPages = [
  ['/', 'Data With Anil | Power BI Dashboards, Data Analytics & Automation', 'Independent data analytics consulting by Anil Singh. Power BI dashboards, Excel automation, SQL reporting, and practical business intelligence.'],
  ['/services', 'Data Analytics Services | Power BI & Excel Automation', 'Practical Power BI development, Excel automation, business intelligence, SQL reporting, and Python data processing for your business.'],
  ['/projects', 'Data Analytics Portfolio | Power BI & Business Intelligence Projects', 'Explore six Power BI case studies in food and beverage inventory, FMCG supply chain, quick commerce, workforce retention, healthcare claims, and HR.'],
  ['/about', 'About Anil | Data Analyst & BI Consultant', 'Meet Anil Singh, an independent Data Analyst and Business Intelligence Consultant with a background in Electronics and Communication Engineering.'],
  ['/process', 'How I Work | Data With Anil', 'From discovery and data assessment to dashboard development, validation, and documented handover.'],
  ['/pricing', 'Analytics Consulting Pricing | Data With Anil', 'Starting estimates for Excel automation, Power BI dashboards, and complete analytics solutions. Request a quote tailored to your requirements.'],
  ['/contact', 'Contact Data With Anil | Start Your Data Analytics Project', 'Discuss your dashboard, reporting, or analytics project with Anil Singh. Email anil0singh02@gmail.com or send a project inquiry.'],
  ['/privacy', 'Privacy Policy | Data With Anil', 'How project inquiries and personal information are handled by Data With Anil.'],
  ['/terms', 'Terms & Conditions | Data With Anil', 'Website terms, project quotations, and information about illustrative analytics demonstrations.'],
].map(([path,title,description])=>({path,title,description}));
const routes = [...staticPages, ...projectMetadata];
const template = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const assets = await readdir(path.join(root, 'dist/assets'));
const pageStyles = assets.find(name => /^Pages-.*\.css$/.test(name));
for (const route of [...routes, { path: '/404', title: 'Page Not Found | Data With Anil', description: 'Return to the Data With Anil homepage or explore the analytics portfolio.' }]) {
  let html = template.replace(/<title>.*?<\/title>/, `<title>${escape(route.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escape(route.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${escape(route.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("\s*\/?>)/, `$1${escape(route.description)}$2`)
    .replace('<div id="root"></div>', `<div id="root">${render(route.path)}</div>`);
  let additions = '';
  if (route.path !== '/' && pageStyles) additions += `<link rel="stylesheet" href="${buildBasePath}assets/${pageStyles}"/>`;
  if (site) additions += `<link rel="canonical" href="${escape(site+route.path)}"/><meta property="og:url" content="${escape(site+route.path)}"/><meta property="og:image" content="${escape(site)}/social-card.png"/>`;
  if (!site || route.path === '/404') additions += '<meta name="robots" content="noindex, nofollow"/>';
  if (process.env.VITE_GOOGLE_SITE_VERIFICATION) additions += `<meta name="google-site-verification" content="${escape(process.env.VITE_GOOGLE_SITE_VERIFICATION)}"/>`;
  const structured = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Data With Anil', description: 'Independent data analytics and business intelligence consulting.', ...(site ? {url:site} : {}), email: 'anil0singh02@gmail.com', founder: { '@type':'Person', name:'Anil Singh', jobTitle:'Data Analyst & Business Intelligence Consultant' }, areaServed: ['India','United States','United Kingdom','Australia','Canada','United Arab Emirates'], hasOfferCatalog: { '@type':'OfferCatalog', name:'Data analytics services', itemListElement:['Power BI dashboard development','Excel automation','Data analysis','SQL reporting','Python data processing'].map(name=>({'@type':'Offer',itemOffered:{'@type':'Service',name}})) } };
  additions += `<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>`;
  html = html.replace('</head>', additions+'</head>');
  const directory = path.join(root, 'dist', route.path === '/' ? '' : route.path.slice(1));
  await mkdir(directory, { recursive:true });
  await writeFile(path.join(directory, 'index.html'), html);
  if (route.path === '/404') await writeFile(path.join(root, 'dist/404.html'), html);
}
await writeFile(path.join(root,'dist/robots.txt'), site ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
await writeFile(path.join(root,'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site ? routes.map(r=>`<url><loc>${escape(site+r.path)}</loc></url>`).join('') : ''}</urlset>`);
await writeFile(path.join(root, 'dist/.nojekyll'), '');
console.log(`Prerendered ${routes.length} pages and a 404 page. ${site ? `SEO domain: ${site}` : 'Set VITE_SITE_URL before publishing to enable indexing, canonical links, and sitemap URLs.'}`);
