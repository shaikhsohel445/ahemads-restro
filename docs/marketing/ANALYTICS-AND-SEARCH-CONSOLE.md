# Analytics and search console setup — Ahemad's Restro website

How Google Analytics 4 (GA4), Google Search Console and Bing Webmaster Tools
are connected to the public marketing site (`/en`, `/ar`). Nothing is
connected yet: no GA4 property id or verification token is stored in this
repository, and none should be.

All settings are `NEXT_PUBLIC_*` build-time variables (see
[`apps/web/.env.example`](../../apps/web/.env.example) and the README's
environment variable table). They are inlined when the web app is built, so
they must be present in the environment of `pnpm --filter @ahemads-restro/web deploy:<env>`
(or `build:cf`); changing them requires a new build and deploy.

## 1. Google Analytics 4

### Enabling it

1. In Google Analytics, create a GA4 property and a **Web** data stream for
   the site's domain. Copy the stream's measurement id (`G-…`).
2. Set it for the web build:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX   # the real id, in the build environment only
   ```
3. Build and deploy the web Worker.

The variable name is `NEXT_PUBLIC_GA_MEASUREMENT_ID` (read in
`apps/web/lib/site/config.ts`). While it is unset or empty, no analytics code,
banner or request exists on the site.

### Consent behaviour

Implemented in `apps/web/components/site/analytics.tsx`, mounted only by the
marketing site layout (`apps/web/app/(site)/[lang]/layout.tsx`). The
restaurant application (`/dashboard`, `/pos`, …), the guest QR pages and the
kiosk never load analytics.

- With an id configured, a first-time visitor sees a consent banner (English
  or Arabic) with **Decline** and **Accept** and a link to the privacy policy.
- Nothing is loaded from Google before the visitor accepts. Only after
  **Accept** does the page load `gtag.js` from `www.googletagmanager.com` and
  configure GA4 with `anonymize_ip: true`.
- The choice is stored in the browser's `localStorage` under
  `ar-analytics-consent` (`granted` or `denied`) and the banner is not shown
  again. Clearing site data shows it again. If storage is blocked, the choice
  applies to the current visit only.
- **Decline** loads nothing and sends nothing.
- Event calls made before consent do nothing (`track()` returns when `gtag`
  is not present).

The privacy policy (`apps/web/content/site/legal/privacy.ts`) describes this
behaviour; keep the two in step if either changes.

### Events sent

All events are sent only after consent.

| Event | Parameters | When |
|---|---|---|
| `generate_lead` | `form: "demo_request"`, `branches` (`1`, `2-5`, `6-20` or `21+`) | The demo request form was accepted by the API (HTTP 2xx), `apps/web/components/site/demo-form.tsx` |
| `cta_click` | `cta: "header_demo"` | "Request a Demo" in the site header (`components/site/site-header.tsx`) |
| `cta_click` | `cta: "hero_demo"`, `"hero_features"` | Home page hero buttons |
| `cta_click` | `cta: "pricing_starter"`, `"pricing_professional"`, `"pricing_multi-branch"` | Pricing plan buttons on the home page |
| `cta_click` | `cta: "call_phone"`, `"visit_wemstudios"` | Phone number and Wem Studios link in the home page contact section |
| `cta_click` | `cta: "final_demo"`, `"final_contact"` | Final call-to-action buttons on the home page |

Plus GA4's automatic page views for the pages a consenting visitor opens. No
personal data from the form (name, e-mail, phone, company, message) is sent
to Google.

In GA4, mark `generate_lead` as a key event (Admin → Events) to count demo
requests as conversions, and register `cta` as a custom dimension
(event-scoped) to report on which button was clicked.

## 2. Google Search Console

### Verify ownership

Use either method; DNS is preferred because it covers every protocol and
subdomain and needs no rebuild.

- **Domain property (DNS)**: in Search Console add a *Domain* property, then
  add the TXT record it shows at the DNS provider (on Cloudflare: DNS →
  Records). Nothing in this repository changes.
- **URL-prefix property (HTML tag)**: choose the *HTML tag* method and copy
  only the value of the `content` attribute from
  `<meta name="google-site-verification" content="…">`. Set it for the web
  build:
  ```bash
  NEXT_PUBLIC_GSC_VERIFICATION=<content value>
  ```
  Rebuild and deploy; `apps/web/lib/site/seo.ts` then adds the meta tag to
  every marketing page. Press **Verify** in Search Console after the deploy.

### Submit the sitemap

1. Make sure `NEXT_PUBLIC_SITE_URL` was set to the canonical origin (for
   example `https://www.example.com`, no trailing slash) for the build.
   Otherwise the sitemap and canonical URLs point at `http://localhost:1995`.
2. Open `https://<your-domain>/sitemap.xml` and `https://<your-domain>/robots.txt`
   and check that every URL uses the real domain.
3. In Search Console → Sitemaps, submit `sitemap.xml`.

The sitemap (`apps/web/app/sitemap.ts`) lists the home page, solution pages,
blog index and articles, privacy and terms in each language they exist in,
with their language alternates. The application, the API, guest QR links and
kiosk links are left out and disallowed in `robots.txt`
(`apps/web/app/robots.ts`); the application also sends `noindex`.

### After launch

- Use URL Inspection on `/en` and `/ar` and request indexing.
- Check Pages → "Why pages aren't indexed" for unexpected exclusions.
- Review the Performance report per page monthly against
  [KEYWORD-MAP.md](KEYWORD-MAP.md) (that document's keywords are
  unvalidated hypotheses until Search Console has data).

## 3. Bing Webmaster Tools

1. Sign in to Bing Webmaster Tools and add the site. The simplest option is
   **Import from Google Search Console**, once Search Console is verified.
2. Otherwise verify with Bing's DNS (CNAME) method. Bing's meta-tag method is
   not wired into the site: there is no environment variable for it, so
   adding one would be a code change in `apps/web/lib/site/seo.ts`.
3. Submit `https://<your-domain>/sitemap.xml` under Sitemaps.

## 4. Checking hreflang

Each marketing page declares, in `apps/web/lib/site/seo.ts`:

- a self-referencing canonical URL;
- `hreflang` alternates only for the languages the page exists in (`en`,
  `ar`), plus `x-default` pointing at the English version (or the only
  version);
- `og:locale` `en_US` or `ar_SA`, and `<html lang dir>` per language.

To check after a deploy:

1. View the source of `/en` and `/ar` and confirm both list each other with
   absolute URLs on the real domain, and that each canonical points to
   itself.
2. Check an English-only page (for example `/en/restaurant-software-india`):
   it must not declare an `ar` alternate, and `/ar/restaurant-software-india`
   must return 404.
3. Confirm the alternates in `sitemap.xml` match the page tags.
4. Use the URL Inspection tool or a third-party hreflang checker on a few
   pages.

`/` is a temporary redirect to `/ar` or `/en` based on the browser's
`Accept-Language` header (`apps/web/next.config.ts`); search engines index
`/en` and `/ar` directly.

## 5. What not to do

- **Do not hardcode ids or tokens** (GA4 measurement id, verification
  tokens, any API key) in source files, `brand.ts`, `wrangler.jsonc` or
  committed `.env` files. Use the build environment.
- **Do not copy an id from another site or invent one.** Leave the variable
  unset until the owner has created the property.
- **Do not load analytics before consent** or bypass the banner (for example
  by adding Google Tag Manager or another tag directly to a layout).
- **Do not send personal data** (names, e-mail addresses, phone numbers,
  form contents) in event parameters.
- **Do not add analytics to the restaurant application**, the guest QR pages
  or the kiosk; they handle restaurants' and guests' data.
- **Do not change the privacy policy's description of analytics** without
  changing the code to match, and vice versa.
- **Do not use permanent redirects for `/`**: the language choice depends on
  the visitor.
