# Inquiry backend

`POST /api/inquiries` accepts JSON with `full_name`, `email`, `company_name`, `country`, `website` (optional), `service`, `project_description`, `budget`, `timeline`, `contact_preference`, `consent: true`, `submission_id` (UUID), and `company_website` (empty spam-trap field). Descriptions must contain 20–5,000 characters. Required short fields are bounded on the server as well as in the browser.

The form receives success only after durable persistence. It retains its UUID across retries: an identical retry returns the original reference, while reusing an ID with changed contents returns HTTP 409. Requests are same-origin JSON, payloads are capped at 16 KiB, and error messages never expose service credentials or database errors. Five accepted inquiries per hashed client IP in 15 minutes are allowed. Production throttling is enforced in a database transaction and is shared across serverless instances. Process-local throttling also limits malformed attempts; it is supplementary and does not constitute distributed bot protection.

## Local development

Run `node --env-file-if-exists=.env scripts/server.mjs`. The API listens on `http://localhost:8787`; Vite proxies `/api` to this address. Without Supabase credentials, the local server explicitly enables disk persistence at `../../work/inquiries.json` relative to this project. This file sits outside the public website. Override `INQUIRY_DATA_PATH` with an absolute private path if you move the project. Do not commit, publish, or share this file: it contains submitted personal information. Local data is serialized with atomic file replacement; use one local server process.

Run `npm run build` and set `PORT=4173` to serve both the built site and API from this server. The server binds only to loopback. Its local success message explicitly says the inquiry was stored locally and was not emailed. No email notification is sent by either backend mode.

## Supabase and Vercel deployment

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor. It creates the inquiry table, an atomic submission RPC, private access rules, and a rate-limit index.
2. In Vercel, import this project with the Vite framework preset, build command `npm run build`, output directory `dist`, and a Node.js runtime of 22 or newer. The included `vercel.json` serves generated HTML metadata for each page and preserves `/api/inquiries` as a Node serverless function. Unknown URLs use the generated `dist/404.html` page with an actual HTTP 404 response. The local server likewise returns HTTP 404 with `dist/404/index.html`.
3. Set server-only environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL` (your full HTTPS domain), and `INQUIRY_RATE_LIMIT_SECRET` (32 or more random characters). Add `ALLOWED_ORIGINS` only for other exact website origins you control. Preview deployment origins from `VERCEL_URL` are allowed automatically.
4. Set `VITE_SITE_URL` to the same website domain and rebuild. The contact email is `anil0singh02@gmail.com`, configured in `src/config.ts`. Optionally provide a local portrait path in `VITE_PORTRAIT_URL`, a Google Search Console verification token in `VITE_GOOGLE_SITE_VERIFICATION`, and a Google Analytics ID in `VITE_GA_MEASUREMENT_ID`. Analytics loads only after opt-in. Never add a Supabase service-role key to a `VITE_` variable or frontend file. Generate a rate-limit secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` on your own terminal and put its output directly in the hosting environment settings.
5. Submit one real test inquiry after deployment. Confirm it appears in Supabase's authenticated Table Editor and that no duplicate row appears after retrying the same submission. Review failed requests in Vercel logs, without adding form contents or credentials to logs.

Production refuses to silently fall back to a local file when storage or hashing credentials are absent. HTTP 503 is returned, and the browser displays a recoverable error. The Supabase migration and live production delivery need your own project credentials and have not been executed against a real account.

## Operations

Inspect inquiries through the Supabase dashboard, which requires your account authentication. There is deliberately no unauthenticated read or admin endpoint. The client identifier is a keyed hash of the network address; raw IP addresses are not stored in the inquiry table. Handle data access/deletion requests through the configured professional email, and choose a documented retention period before publishing. The SQL file includes an optional cleanup example; it is not scheduled automatically.

Email is the direct contact channel. Submitting an inquiry stores it; it does not email a notification. Add an email delivery provider server-side if you later want notifications; save the inquiry before attempting notification so provider downtime does not lose leads.

The supplied Content Security Policy permits local assets, React/Recharts inline styles, and the Google endpoints needed by optional analytics. Fonts and portraits are served locally; place the real founder photograph under `public/images/` and use its website path. Remote portrait hosts are blocked unless you deliberately add their exact origin to `img-src` in both `vercel.json` and `scripts/server.mjs`. No third-party framing is allowed. The Google origins in the policy do not themselves load analytics; the frontend's consent choice controls loading.

## Verification

Run `node --test tests/backend.test.mjs` for validation, origin, real local persistence, retry, failure, size and throttling checks. These use isolated temporary files, never the live local inquiry file. Supabase RPC behavior still needs a deployment smoke test with your configured database.
