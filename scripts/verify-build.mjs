import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectMetadata,buildBasePath,buildStaticHosting} from '../.prerender/prerender.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist = path.join(root,'dist');
const routes = ['/', '/services','/projects','/about','/process','/pricing','/contact','/privacy','/terms',...projectMetadata.map(project => project.path)];
const localUrl = (url) => {
 assert(url.startsWith(buildBasePath), `Internal URL ${url} starts with hosting base ${buildBasePath}`);
 return `/${url.slice(buildBasePath.length)}`;
};
const titles=new Set();
for(const route of routes){
 const html=await readFile(path.join(dist,route==='/'?'index.html':route.slice(1)+'/index.html'),'utf8');
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];
 assert(title,`${route} has a title`); assert(!titles.has(title),`${route} has a unique title`); titles.add(title);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${route} has one prerendered h1`);
 assert(html.includes('anil0singh02@gmail.com'),`${route} includes the supplied email`);
 assert(html.includes('Data With Anil'),`${route} includes the current website name`);
 assert(!/Anil Analytics|ANIL ANALYTICS/.test(html),`${route} has no previous brand name`);
 assert(!/href="(?:https?:\/\/)?(?:wa\.me|www\.linkedin\.com|calendly\.com)/.test(html),`${route} has no excluded contact channels`);
 for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
  const file = localUrl(url);
  if(file.startsWith('/assets/') || file.startsWith('/images/')) await stat(path.join(dist,file.slice(1)));
 }
 for(const [,url] of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
  const file = localUrl(url);
  if(file.startsWith('/assets/')||file==='/favicon.svg') continue;
  if(file.startsWith('/images/')) { await stat(path.join(dist,file.slice(1))); continue; }
  assert(routes.includes(file),`${route} links to known route ${file}`);
 }
}
await stat(path.join(dist,'404.html'));
await stat(path.join(dist,'social-card.png'));
await stat(path.join(dist,'images','anil.webp'));
const home = await readFile(path.join(dist,'index.html'),'utf8');
assert(home.includes('class="hero-portrait"'), 'Homepage introduction includes the supplied portrait');
assert(home.includes(`${buildBasePath}images/anil.webp`), 'Homepage references the optimized local portrait');
const portfolio = await readFile(path.join(dist,'projects','index.html'),'utf8');
for (const client of ['leading food and beverage retail organization','AtliQ Mart','Blinkit','OLA','Phoenix Assurance Private Limited','Confidential organization']) assert(portfolio.includes(client), `Portfolio identifies ${client}`);
const supply = await readFile(path.join(dist,'projects','supply-chain-inventory-analytics','index.html'),'utf8');
assert(supply.includes('leading food and beverage retail organization'), 'Supply Chain uses requested client label');
assert(supply.includes('synthetic'), 'Supply Chain figures are clearly identified as synthetic');
assert(!/<iframe[ >]/.test(supply), 'Supply Chain retains its existing dashboard instead of a Power BI embed');
for (const project of projectMetadata) {
 const html = await readFile(path.join(dist, project.path.slice(1), 'index.html'), 'utf8');
 for (const [, tag] of html.matchAll(/(<iframe\b[^>]*>)/g)) {
  const src = tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
  const url = new URL(src);
  assert(url.origin === 'https://app.powerbi.com' && url.pathname === '/view' && url.searchParams.get('r'), `${project.path} embeds an actual public Power BI report link`);
  assert(/\btitle="[^"]+"/.test(tag) && /allowFullScreen/i.test(tag), `${project.path} has a titled report and full-screen access`);
  assert(html.includes('Open published report'), `${project.path} provides an external report fallback`);
 }
}
const atliq = await readFile(path.join(dist,'projects','atliq-mart-fmcg-supply-chain','index.html'),'utf8');
assert(atliq.includes('Rajendra Kumar Oram'), 'AtliQ adaptation preserves original report design credit');
if (buildStaticHosting) {
 const contact = await readFile(path.join(dist,'contact','index.html'),'utf8');
 assert(!/<form[ >]/.test(contact), 'Static hosting has no unavailable inquiry submission form');
 assert(contact.includes('Email your project brief'), 'Static hosting provides an email inquiry link');
 assert(contact.includes('mailto:anil0singh02@gmail.com?subject='), 'Static inquiry link addresses the supplied email');
}
await stat(path.join(dist,'robots.txt'));
await stat(path.join(dist,'sitemap.xml'));
console.log(`Verified ${routes.length} prerendered routes, unique titles, internal links, email-only contact, assets, and SEO files.`);
