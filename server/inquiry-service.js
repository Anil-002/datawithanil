import { createHash, createHmac, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const BODY_LIMIT = 16_384;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const memoryLimits = new Map();
let localQueue = Promise.resolve();

export class InquiryError extends Error {
  constructor(status, message, fields) { super(message); this.status = status; this.fields = fields; }
}

export function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InquiryError(400, 'Send a valid project inquiry.');
  if (input.company_website) throw new InquiryError(422, 'We could not accept this submission. Please contact us through the form.');
  const fields = {};
  const clean = (key, min, max, optional = false) => {
    const value = typeof input[key] === 'string' ? input[key].replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : '';
    if ((!optional || value) && (value.length < min || value.length > max)) fields[key] = `Please enter ${min}–${max} characters.`;
    return value;
  };
  const value = {
    full_name: clean('full_name', 2, 120),
    email: clean('email', 3, 254).toLowerCase(),
    company_name: clean('company_name', 2, 160),
    country: clean('country', 2, 80),
    website: clean('website', 4, 500, true),
    service: clean('service', 1, 120),
    project_description: clean('project_description', 20, 5000),
    budget: clean('budget', 1, 120),
    timeline: clean('timeline', 1, 120),
    contact_preference: clean('contact_preference', 1, 100),
  };
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.email)) fields.email = 'Enter a valid email address.';
  if (value.website) {
    try { const parsed = new URL(value.website); if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); }
    catch { fields.website = 'Enter a complete website URL beginning with https:// or http://.'; }
  }
  if (input.consent !== true) fields.consent = 'Please agree to the privacy policy before submitting.';
  if (typeof input.submission_id !== 'string' || !UUID.test(input.submission_id)) fields.submission_id = 'Refresh the page and try again.';
  if (Object.keys(fields).length) throw new InquiryError(422, 'Please check the highlighted fields.', fields);
  return { ...value, consent: true, submission_id: input.submission_id.toLowerCase() };
}

export function isProduction(env) { return env.NODE_ENV === 'production' || env.VERCEL === '1'; }

export function assertOrigin(req, env) {
  const allowed = new Set();
  for (const candidate of [env.SITE_URL, env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '', ...(env.ALLOWED_ORIGINS || '').split(',')]) {
    if (!candidate) continue;
    try { const url = new URL(candidate.trim()); if (['http:', 'https:'].includes(url.protocol)) allowed.add(url.origin); } catch { /* Invalid configuration is never trusted. */ }
  }
  if (!isProduction(env)) {
    for (const port of [5173, 4173, 8787]) for (const host of ['localhost', '127.0.0.1']) allowed.add(`http://${host}:${port}`);
  }
  if (!allowed.size) throw new InquiryError(503, 'The inquiry service is awaiting configuration. Please try again later.');
  const origin = req.headers.origin;
  if (origin && (!allowed.has(origin) || origin === 'null')) throw new InquiryError(403, 'This website is not authorized to submit inquiries.');
  if (req.headers['sec-fetch-site'] === 'cross-site' && !origin) throw new InquiryError(403, 'This request is not authorized.');
}

export async function readBody(req) {
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new InquiryError(415, 'Send the form as JSON.');
  if (Number(req.headers['content-length'] || 0) > BODY_LIMIT) throw new InquiryError(413, 'Your inquiry is too large. Please shorten the description.');
  // Vercel may have already parsed the request body.
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > BODY_LIMIT) throw new InquiryError(413, 'Your inquiry is too large.');
    try { return JSON.parse(raw); } catch { throw new InquiryError(400, 'The request contains invalid JSON.'); }
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > BODY_LIMIT) throw new InquiryError(413, 'Your inquiry is too large. Please shorten the description.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new InquiryError(400, 'The request contains invalid JSON.'); }
}

function clientFingerprint(req, env) {
  const ip = env.VERCEL === '1'
    ? String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
    : req.socket?.remoteAddress || 'local';
  const secret = env.INQUIRY_RATE_LIMIT_SECRET || 'local-preview-only';
  if (isProduction(env) && secret.length < 32) throw new InquiryError(503, 'The inquiry service is awaiting configuration. Please try again later.');
  return createHmac('sha256', secret).update(ip).digest('hex');
}

function coarseRateLimit(fingerprint) {
  const now = Date.now();
  for (const [key, item] of memoryLimits) if (item.until < now) memoryLimits.delete(key);
  const entry = memoryLimits.get(fingerprint) || { count: 0, until: now + WINDOW_MS };
  // Includes invalid attempts; durable storage below separately limits accepted inquiries.
  if (entry.count >= 30 || (!memoryLimits.has(fingerprint) && memoryLimits.size >= 10_000)) throw new InquiryError(429, 'Too many attempts. Please try again in 15 minutes.');
  entry.count += 1;
  memoryLimits.set(fingerprint, entry);
}

function hashPayload(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

async function saveLocal(value, fingerprint, hash, env) {
  if (isProduction(env) || env.ALLOW_LOCAL_INQUIRIES !== 'true' || !env.INQUIRY_DATA_PATH) throw new InquiryError(503, 'The inquiry service is awaiting configuration. Please try again later.');
  const file = path.resolve(env.INQUIRY_DATA_PATH);
  const operation = localQueue.then(async () => {
    let records = [];
    try { records = JSON.parse(await readFile(file, 'utf8')); if (!Array.isArray(records)) throw new Error('Invalid local store'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const existing = records.find((item) => item.submission_id === value.submission_id);
    if (existing) {
      if (existing.payload_hash !== hash) throw new InquiryError(409, 'This submission has already been used. Start a new inquiry.');
      return existing.id;
    }
    const cutoff = Date.now() - WINDOW_MS;
    if (records.filter((item) => item.client_hash === fingerprint && Date.parse(item.created_at) > cutoff).length >= MAX_REQUESTS) throw new InquiryError(429, 'Too many inquiries. Please try again in 15 minutes.');
    const record = { id: randomUUID(), ...value, created_at: new Date().toISOString(), client_hash: fingerprint, payload_hash: hash };
    records.push(record);
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(records, null, 2), { mode: 0o600 });
    await rename(temporary, file);
    return record.id;
  });
  localQueue = operation.catch(() => {});
  return operation;
}

async function saveSupabase(value, fingerprint, hash, env) {
  let base;
  try { base = new URL(env.SUPABASE_URL); if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error(); }
  catch { throw new InquiryError(503, 'The inquiry service is awaiting configuration. Please try again later.'); }
  const response = await fetch(`${base.origin}/rest/v1/rpc/submit_inquiry`, {
    method: 'POST', signal: AbortSignal.timeout(12_000),
    headers: { 'Content-Type': 'application/json', apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
    body: JSON.stringify({ p_payload: value, p_client_hash: fingerprint, p_payload_hash: hash }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (body.message === 'INQUIRY_RATE_LIMIT') throw new InquiryError(429, 'Too many inquiries. Please try again in 15 minutes.');
    if (body.message === 'INQUIRY_IDEMPOTENCY_CONFLICT') throw new InquiryError(409, 'This submission has already been used. Start a new inquiry.');
    throw new InquiryError(503, 'We could not save your inquiry. Please try again shortly.');
  }
  if (typeof body !== 'string' || !UUID.test(body)) throw new InquiryError(503, 'We could not confirm your inquiry. Please try again.');
  return body;
}

export function createInquiryHandler({ env = process.env } = {}) {
  return async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { success: false, error: 'Use the project inquiry form to send a POST request.' }); }
    try {
      assertOrigin(req, env);
      const fingerprint = clientFingerprint(req, env);
      coarseRateLimit(fingerprint);
      const value = validateInquiry(await readBody(req));
      const hasSupabase = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
      const reference = hasSupabase
        ? await saveSupabase(value, fingerprint, hashPayload(value), env)
        : await saveLocal(value, fingerprint, hashPayload(value), env);
      send(201, { success: true, reference, message: hasSupabase
        ? 'Your project inquiry has been received. Thank you for sharing your requirements.'
        : 'Your inquiry has been saved in this local preview. It has not been emailed to Anil.' });
    } catch (error) {
      const status = error instanceof InquiryError ? error.status : 503;
      if (status === 429) res.setHeader('Retry-After', '900');
      send(status, { success: false, error: error instanceof InquiryError ? error.message : 'We could not save your inquiry. Please try again shortly.', ...(error.fields ? { fields: error.fields } : {}) });
    }
  };
}
