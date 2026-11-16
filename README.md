# Data With Anil

A complete React and TypeScript portfolio for Anil Singh’s independent data analytics consultancy. The design uses warm ivory, charcoal, mustard accents, and editorial serif typography inspired by your reference image.

## GitHub Pages

The included `.github/workflows/deploy-pages.yml` builds and publishes this site from the `main` branch. In the repository’s **Settings → Pages**, select **GitHub Actions** as the source. The workflow obtains the repository’s public URL and base path from GitHub, so navigation, images, canonical links, and sharing URLs work on a project site such as `https://your-username.github.io/datawithanil/`.

The current public build settings target **https://anil-002.github.io/datawithanil/**. A prebuilt `docs/` folder is also provided for publishing without Actions: upload the source and `docs/` files to `Anil-002/datawithanil`, then select **Deploy from a branch → main → /docs** in **Settings → Pages**. Keep `docs/.nojekyll`. Future source changes require running `npm ci`, `npm run build:pages`, and uploading the refreshed `docs/` contents. Choose either the Actions method or the branch method for deployment.

GitHub Pages serves the frontend only. Its published contact page opens an email draft addressed to `anil0singh02@gmail.com`; the visitor reviews and sends that message in their email app. It does not display an inquiry-submission form or claim a message has been saved. The API, database schema, and server source remain available for deployment to a server-capable host.

To build the same static version outside the workflow, set `VITE_BASE_PATH=/datawithanil/`, `VITE_SITE_URL=https://your-username.github.io/datawithanil`, and `VITE_STATIC_HOSTING=true`, then run `npm run build` and `node scripts/verify-build.mjs`. Upload the contents of `dist/` to the publishing directory, keeping `.nojekyll`. Source and generated assets are separate: do not publish `node_modules`, environment secrets, or original PBIX files.

**The only contact channel shown is `anil0singh02@gmail.com`.** LinkedIn, WhatsApp, and booking links are intentionally omitted as requested.

## Published Power BI reports

`src/data/powerBIReports.ts` maps AtliQ, Blinkit, OLA, insurance, and HR Diversity Inclusion to their Power BI reports. The Supply Chain inventory showcase is excluded and keeps its current layout, filters, data, and wording.

Set each `publicEmbedUrl` to the exact HTTPS `https://app.powerbi.com/view?r=...` link obtained from **File → Embed report → Publish to web (public)**. An ordinary Share link is not a public embed. Empty or invalid public links keep the clearly labelled synthetic preview, with an existing report link where available; Microsoft sign-in and report access may be required. Public links enable interactive reports on the detail pages and expanded views, while project cards remain sample thumbnails.

Publish to web makes the report and all data in its semantic model anonymously accessible on the internet. Obtain the owner's approval and confirm that the source data is appropriate for public sharing before creating these links. Do not publish confidential client, employee, personal, or claims data. The local server and Vercel configuration permit frames only from `https://app.powerbi.com`.

After adding verified public links, build and push the changed source to `main`. The existing GitHub Actions workflow publishes the website. Public report updates follow the Power BI report and model refresh; the website does not configure or schedule refreshes.

## Run locally

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run build
npm start
```

Open **http://localhost:8787**. The server serves the built website and the inquiry API from one address. A prebuilt `dist/` is included in the downloadable archive, so `npm start` can serve that version without installing frontend dependencies. Install dependencies before rebuilding or developing.

For live development, run these commands in separate terminals:

```sh
npm run api
```

```sh
npm run dev
```

Open the Vite URL, normally **http://127.0.0.1:5173**. Vite forwards `/api` requests to the API on port 8787.

## What’s included

- Home, Services, Projects, About, Process, Pricing, Contact, Privacy, and Terms pages.
- Six case studies based on the supplied Power BI reports: food and beverage inventory, AtliQ Mart FMCG delivery, Blinkit commerce, OLA rider retention, Phoenix Assurance healthcare claims, and HR diversity and inclusion.
- Working project filters, keyboard-accessible navigation, FAQs, and expanded dashboard previews.
- Five public interactive Power BI reports on case-study pages and expanded views. Supply Chain keeps its existing navy/teal interactive inventory showcase and synthetic data. Project cards use sample previews or verified report topics.
- An interactive five-step Excel reporting demonstration with a calculated sample revenue total.
- Project inquiries with client and server validation, consent, loading and error states, duplicate protection, and real persistence.
- A local file store for development and a secure server-side Supabase integration for production.
- Responsive layouts, visible focus states, reduced-motion support, descriptive chart summaries, and code splitting.
- Prerendered HTML for all 15 public pages and a 404 page, individual metadata, structured data, social preview, robots.txt, and XML sitemap.
- Optional GA4 analytics behind an explicit opt-in, and an optional Search Console verification tag.
- Vercel configuration, database schema, backend documentation, and automated backend tests.

Sample dashboard card previews and the Supply Chain showcase use **illustrative synthetic data**. The HR card shows verified report topics without sample figures. When a public Power BI link is configured, the corresponding project detail page displays the published report and its own figures. Client / organization labels describe the supplied report context. They do not establish a commissioned engagement or endorsement. The HR employer is labelled Confidential organization because its name was not present. Supply Chain uses the exact requested label, leading food and beverage retail organization. The AtliQ source credits Rajendra Kumar Oram; that original report design credit is preserved. Your supplied portrait appears in the homepage introduction, founder section, and About page.

## Inquiry behavior

In local mode, accepted inquiries are saved to `../../work/inquiries.json`, relative to this project directory. The API explicitly confirms local storage. **Submitting the form does not send email.** The email link opens the visitor’s email application.

In production, inquiries are stored in your Supabase database. If the database configuration is absent or storage fails, the API returns an error; it does not display a false success. View inquiries in the private Supabase dashboard. Email notifications can be added separately if desired.

The production API includes body-size limits, origin checking, a honeypot, rate limiting, and idempotent submissions. The SQL schema enables row-level security and denies direct anonymous access. Never put a Supabase service-role key into a `VITE_` environment variable.

## Configure and deploy

1. Create a Supabase project and execute the complete [database schema](supabase/schema.sql) in its SQL editor. This creates the tables, constraints, and server-only submission function.
2. Upload this project to a Git repository and import it into Vercel. Choose the folder containing this README as the project root.
3. Vercel uses the included configuration: build command `npm run build`, output directory `dist`, and server function `/api/inquiries`.
4. Set these environment variables in Vercel before the final production build:

   - `VITE_SITE_URL`: your public HTTPS origin, for example `https://your-domain.com`, without a trailing slash or path.
   - `SITE_URL`: the same public origin, used by server-side origin validation.
   - `SUPABASE_URL`: your Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service-role credential.
   - `INQUIRY_RATE_LIMIT_SECRET`: a random secret of at least 32 characters.

5. Deploy, open your live site, and submit an inquiry using your own test details. Verify the record in Supabase. Test a retry and confirm that only one record was stored.
6. Add your domain, then rebuild with `VITE_SITE_URL` and `SITE_URL` set to its final HTTPS origin. Submit `/sitemap.xml` to Search Console if you use it.

Without `VITE_SITE_URL`, the build deliberately disables indexing and leaves the sitemap empty. This keeps an unfinished preview out of search results. Setting the final domain and rebuilding creates canonical URLs, sharing URLs, and the sitemap.

If a staging origin needs to submit inquiries, add the exact origin to `ALLOWED_ORIGINS`. The current Vercel deployment URL is already supported. See [BACKEND.md](BACKEND.md) for the complete server setup and verification checklist.

## Optional configuration

Copy `.env.example` to `.env` for local settings. Never commit `.env` or credentials.

- `VITE_PORTRAIT_URL`: a local image such as `/images/anil.webp`. Put your real photograph in `public/images/`. The supplied image defaults to /images/anil.webp on all introduction sections. The About page keeps a fallback if the image cannot load.
- `VITE_GOOGLE_SITE_VERIFICATION`: your Google Search Console verification token, added at build time.
- `VITE_GA_MEASUREMENT_ID`: your GA4 ID. No analytics loads by default. When configured, the visitor can allow, decline, or withdraw analytics through the privacy control. **Disable Enhanced Measurement in the GA4 web stream** so its automatic form and history events do not duplicate or expand the explicit page-view tracking. This site’s explicit page views omit query strings and form fields.
- `PORT`: local server port, default `8787`.
- `INQUIRY_DATA_PATH`: an absolute private path for the local inquiry JSON file.

## Edit the website

- `src/config.ts`: brand, email, domain, and photograph configuration.
- `src/data/content.ts`: services, project descriptions, FAQs, pricing, and process content.
- `src/pages/Home.tsx`: homepage sections and Excel demonstration.
- `src/pages/Pages.tsx`: the remaining pages and contact form.
- `src/components/Dashboard.tsx`: fictional data, metric calculations, and charts.
- `src/styles.css`: global design system and homepage styles.
- `src/pages/pages.css`: secondary page layouts.
- `server/inquiry-service.js`: server-side validation and storage.
- `scripts/generate-seo.mjs`: prerendered page metadata, structured data, sitemap, and robots configuration.

Pricing uses the supplied starting estimates: ₹3,000 for Excel automation, ₹7,000 for a Power BI dashboard, and ₹15,000 for a complete analytics solution. Final scope, licensing, and maintenance are quoted separately.

## Validation

```sh
npm test
npm run build
node scripts/verify-build.mjs
```

Backend tests cover successful persistence, validation failures, consent, duplicate protection, rate limits, origin checks, request limits, and mocked production storage behavior. Production credentials and a live Supabase database are not part of the delivered source; complete a live submission check after deployment.

## Still needed from you before going live

- Your final domain and hosting/Supabase configuration.
- The supplied portrait is included. Original PBIX files remain in their source folder and are excluded from the website and archive.
- A final review of the service wording, starting prices, privacy notice, and terms for your actual consulting arrangements.

There are no missing email, social, or booking placeholders on the published pages.
