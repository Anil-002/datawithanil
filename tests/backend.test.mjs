import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createInquiryHandler, validateInquiry, InquiryError } from '../server/inquiry-service.js';

const valid = (extra = {}) => ({
  full_name: 'Test Person', email: 'test@example.com', company_name: 'Example Business', country: 'India',
  website: '', service: 'Power BI Dashboard Development',
  project_description: 'I would like a monthly sales dashboard combining our Excel reports.',
  budget: 'Not decided yet', timeline: 'Flexible', contact_preference: 'Email', consent: true,
  submission_id: randomUUID(), company_website: '', ...extra,
});

async function withServer(extraEnv, fn) {
  const folder = await mkdtemp(path.join(tmpdir(), 'anil-inquiry-test-'));
  const file = path.join(folder, 'inquiries.json');
  const env = { ALLOW_LOCAL_INQUIRIES: 'true', INQUIRY_DATA_PATH: file, INQUIRY_RATE_LIMIT_SECRET: randomUUID(), ...extraEnv };
  const handler = createInquiryHandler({ env });
  // Exercise the actual request-stream handler without requiring network access.
  // Filesystem persistence is real and isolated for each test.
  const request = async (body, options = {}) => {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    const req = Readable.from([Buffer.from(raw)]);
    req.method = options.method || 'POST';
    req.headers = Object.fromEntries(Object.entries({ 'Content-Type': 'application/json', Origin: 'http://localhost:5173', ...options.headers }).map(([key, value]) => [key.toLowerCase(), value]));
    req.socket = { remoteAddress: '127.0.0.1' };
    const headers = new Map();
    let data;
    const res = { statusCode: 200, setHeader: (key, value) => headers.set(key.toLowerCase(), String(value)), end: (value) => { data = JSON.parse(value); } };
    await handler(req, res);
    return { status: res.statusCode, headers, data };
  };
  try { await fn({ request, file }); }
  finally { await rm(folder, { recursive: true, force: true }); }
}

test('normalizes whitespace and email but preserves meaningful Unicode', () => {
  const result = validateInquiry(valid({ full_name: '  Anil Singh  ', email: ' Test@Example.COM ', country: ' भारत ' }));
  assert.equal(result.full_name, 'Anil Singh');
  assert.equal(result.email, 'test@example.com');
  assert.equal(result.country, 'भारत');
});

test('validates consent, required fields, UUID and dangerous website schemes', () => {
  assert.throws(() => validateInquiry(valid({ full_name: '', email: 'invalid', consent: false, website: 'javascript:alert(1)', submission_id: 'bad' })), (error) => {
    assert(error instanceof InquiryError);
    assert.equal(error.status, 422);
    for (const key of ['full_name', 'email', 'consent', 'website', 'submission_id']) assert(key in error.fields);
    return true;
  });
  assert.throws(() => validateInquiry(valid({ company_website: 'spam.example' })), { status: 422 });
});

test('persists before success and handles concurrent identical retries exactly once', async () => {
  await withServer({}, async ({ request, file }) => {
    const payload = valid();
    const responses = await Promise.all([request(payload), request(payload)]);
    assert.deepEqual(responses.map((item) => item.status), [201, 201]);
    assert.equal(responses[0].data.reference, responses[1].data.reference);
    assert.match(responses[0].data.message, /local preview/);
    const records = JSON.parse(await readFile(file, 'utf8'));
    assert.equal(records.length, 1);
    assert.equal(records[0].email, payload.email);
    assert.equal(records[0].consent, true);
    assert.equal(records[0].id, responses[0].data.reference);
    assert.equal(records[0].client_hash.length, 64);
    assert.equal('ip' in records[0], false);
    const conflict = await request({ ...payload, full_name: 'Changed Person' });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.data.success, false);
  });
});

test('denies untrusted origins and GET without accepting data', async () => {
  await withServer({}, async ({ request, file }) => {
    const result = await request(valid(), { headers: { 'Content-Type': 'application/json', Origin: 'https://malicious.example' } });
    assert.equal(result.status, 403);
    const get = await request(valid(), { method: 'GET' });
    assert.equal(get.status, 405);
    assert.equal(get.headers.get('allow'), 'POST');
    await assert.rejects(readFile(file), { code: 'ENOENT' });
  });
});

test('invalid JSON, oversized payloads and non-JSON bodies are rejected', async () => {
  await withServer({}, async ({ request }) => {
    assert.equal((await request('{no')).status, 400);
    assert.equal((await request(valid({ project_description: 'a'.repeat(17_000) }))).status, 413);
    assert.equal((await request(valid(), { headers: { 'Content-Type': 'text/plain', Origin: 'http://localhost:5173' } })).status, 415);
    const invalid = await request(valid({ project_description: 'short' }));
    assert.equal(invalid.status, 422);
    assert(invalid.data.fields.project_description);
  });
});

test('accepted inquiries are rate limited across persisted records', async () => {
  await withServer({}, async ({ request, file }) => {
    for (let i = 0; i < 5; i++) assert.equal((await request(valid())).status, 201);
    const result = await request(valid());
    assert.equal(result.status, 429);
    assert.equal(result.headers.get('retry-after'), '900');
    assert.equal(JSON.parse(await readFile(file, 'utf8')).length, 5);
  });
});

test('production cannot use the local preview store, even if enabled', async () => {
  await withServer({ NODE_ENV: 'production', SITE_URL: 'http://localhost:5173' }, async ({ request, file }) => {
    const result = await request(valid());
    assert.equal(result.status, 503);
    assert.equal(result.data.success, false);
    await assert.rejects(readFile(file), { code: 'ENOENT' });
  });
});

test('storage failures never claim that an inquiry was received', async () => {
  await withServer({ ALLOW_LOCAL_INQUIRIES: 'false' }, async ({ request }) => {
    const result = await request(valid());
    assert.equal(result.status, 503);
    assert.equal(result.data.success, false);
    assert.equal('reference' in result.data, false);
  });
});

test('configured production uses the restricted Supabase RPC and returns its saved reference', async () => {
  const originalFetch = globalThis.fetch;
  const savedId = randomUUID();
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return { ok: true, json: async () => savedId };
  };
  try {
    await withServer({ NODE_ENV: 'production', SITE_URL: 'http://localhost:5173', SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'private-test-key' }, async ({ request, file }) => {
      const payload = valid();
      const result = await request(payload);
      assert.equal(result.status, 201);
      assert.equal(result.data.reference, savedId);
      assert.equal(captured.url, 'https://test.supabase.co/rest/v1/rpc/submit_inquiry');
      assert.equal(captured.options.headers.Authorization, 'Bearer private-test-key');
      const rpc = JSON.parse(captured.options.body);
      assert.equal(rpc.p_payload.submission_id, payload.submission_id);
      assert.equal(rpc.p_client_hash.length, 64);
      assert.equal(JSON.stringify(result.data).includes('private-test-key'), false);
      await assert.rejects(readFile(file), { code: 'ENOENT' });
    });
  } finally { globalThis.fetch = originalFetch; }
});

test('database rejection returns a recoverable error without leaking backend details', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'sensitive database information', code: '42501' }) });
  try {
    await withServer({ NODE_ENV: 'production', SITE_URL: 'http://localhost:5173', SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'private-test-key' }, async ({ request, file }) => {
      const result = await request(valid());
      assert.equal(result.status, 503);
      assert.equal(result.data.success, false);
      assert.equal(JSON.stringify(result.data).includes('sensitive'), false);
      await assert.rejects(readFile(file), { code: 'ENOENT' });
    });
  } finally { globalThis.fetch = originalFetch; }
});
