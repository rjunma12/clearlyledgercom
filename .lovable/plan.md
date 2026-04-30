## Goal
Produce a clean, Google Search Console–ready `public/sitemap.xml` that exactly reflects the public routes in `src/App.tsx`, with current `lastmod` dates, sane priorities, and no broken/missing entries.

## Audit of current sitemap vs. routes

**Missing from current sitemap (public routes that should be indexed):**
- `/refund-policy`
- `/blog/why-banks-dont-provide-csv-excel-statements`
- `/blog/australia-bank-statement-converter`

**Already present and correct:** home, pricing, features, blog index, all 7 country/topic posts, 3 new SEO posts, comparison, rule-based-vs-AI, about, contact, security, privacy-policy, terms-of-service, data-processing.

**Correctly excluded (private / utility / noindex):** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/dashboard`, `/checkout/success`, `/upgrade/success`, `/admin/bank-profiles`, `*` (NotFound). These also align with `robots.txt` Disallow rules.

## Changes

### 1. `public/sitemap.xml` — regenerate
- Add the 3 missing URLs above.
- Normalize `lastmod` to today (`2026-04-30`) for all entries (single, consistent crawl signal).
- Keep priorities tiered:
  - `1.0` — `/`
  - `0.9` — `/pricing`, top 3 SEO blog posts (convert-pdf-guide, accountants, comparison, rule-based-vs-ai)
  - `0.8` — `/features`, `/blog`, csv-format post
  - `0.7` — country/topic blog posts (UK, Japan, India, Malaysia, South Africa, Australia, why-banks-dont-provide-csv, convert-bank-statements-to-excel, privacy-secure, accurate-workflows)
  - `0.6` — `/about`, `/contact`, `/security`
  - `0.5` — `/privacy-policy`, `/terms-of-service`, `/refund-policy`, `/data-processing`
- `changefreq`: `daily` for `/` and `/blog`; `weekly` for blog posts, pricing, features; `monthly` for about/contact/security; `yearly` for legal pages.
- Valid XML 1.0, UTF-8, sitemaps.org 0.9 schema, no trailing whitespace issues.

### 2. `public/robots.txt` — no change needed
Already references `https://clearlyledger.com/sitemap.xml`.

## After deploy — Google Search Console steps (for the user)
1. Verify the property `https://clearlyledger.com` (DNS or HTML tag) if not already.
2. In GSC → Sitemaps → submit: `sitemap.xml`
3. Use **URL Inspection** on a couple of new blog URLs → "Request Indexing".
4. Confirm `https://clearlyledger.com/sitemap.xml` returns HTTP 200 with `Content-Type: application/xml`.

## Out of scope
- No new image or video sitemap (not needed; Article schema on blog posts already covers rich results).
- No hreflang sitemap (site is single-language).
- No `/admin/*` or auth pages (intentionally private).
