import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInquiryHandler } from '../server/inquiry-service.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 8787);
const env = { ...process.env };
// Local development uses a real disk store. Production never falls back to disk.
if (env.NODE_ENV !== 'production' && env.VERCEL !== '1') {
  env.ALLOW_LOCAL_INQUIRIES ??= 'true';
  env.INQUIRY_DATA_PATH ||= path.resolve(root, '../../work/inquiries.json');
}
const inquiryHandler = createInquiryHandler({ env });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const csp = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com; frame-src 'none'";

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL'); }
  if (pathname === '/api/inquiries') return inquiryHandler(req, res);
  if (pathname === '/api/health' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ status: 'ok', storage: env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? 'supabase' : env.NODE_ENV === 'production' ? 'unconfigured' : 'local-preview' }));
  }
  if (pathname.startsWith('/api/')) { res.writeHead(404); return res.end('Not found'); }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end('Method not allowed'); }
  let target = path.resolve(dist, `.${pathname}`);
  if (target !== dist && !target.startsWith(`${dist}${path.sep}`)) { res.writeHead(403); return res.end('Forbidden'); }
  if (pathname.split('/').some((segment) => segment.startsWith('.'))) { res.writeHead(404); return res.end('Not found'); }
  try {
    let file;
    let status = 200;
    try {
      const info = await stat(target);
      if (info.isDirectory()) target = path.join(target, 'index.html');
      else if (!info.isFile()) throw new Error('Not a file');
      file = await readFile(target);
    }
    catch {
      if (path.extname(pathname)) { res.writeHead(404); return res.end('Not found'); }
      target = path.join(dist, '404', 'index.html');
      file = await readFile(target);
      status = 404;
    }
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    res.setHeader('Cache-Control', target.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache');
    res.statusCode = status;
    res.end(req.method === 'HEAD' ? undefined : file);
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('The API is running. Start Vite for development, or run npm run build to serve the website here.');
  }
});

server.requestTimeout = 20_000;
server.headersTimeout = 10_000;
server.listen(port, '127.0.0.1', () => console.log(`Data With Anil local server: http://localhost:${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
