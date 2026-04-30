## What you currently have

- `public/sitemap.xml` — only 3 URLs (`/`, `/pricing`, `/features`). **Missing 24 public pages including all 16 blog posts.**
- `public/robots.txt` — present and well-structured, but doesn't block AI scrapers.
- No verification mechanism for Google Search Console or Bing Webmaster Tools.

## What I'll do

### 1. Rewrite `public/sitemap.xml` with all 27 public URLs

- 7 marketing pages: `/`, `/pricing`, `/features`, `/about`, `/contact`, `/security`, `/data-processing`
- 3 legal pages: `/privacy-policy`, `/terms-of-service`, `/refund-policy`
- 1 blog index: `/blog`
- 16 blog post URLs (all current posts incl. country pages: India, UK, AU, ZA, MY, JP)

Each entry gets `<lastmod>2026-04-30</lastmod>`, sensible `<changefreq>` (weekly for marketing, monthly for blog/legal), and `<priority>` from 1.0 (homepage) down to 0.4 (legal).

### 2. Tighten `public/robots.txt`

- Keep all existing allow/disallow rules.
- Add explicit blocks for AI scrapers: `GPTBot`, `CCBot`, `anthropic-ai`, `ClaudeBot` (you can remove these if you want AI training visibility — your call).
- Add `Disallow: /api/` to keep crawlers off backend routes.
- Add `Crawl-delay: 1` for Bingbot (Google ignores this; Bing honours it).
- Keep the `Sitemap:` reference.

### 3. Add verification meta tags to `index.html`

Add two empty meta tags in `<head>` ready for you to paste verification codes into:

```html
<meta name="google-site-verification" content="REPLACE_WITH_GOOGLE_CODE" />
<meta name="msvalidate.01" content="REPLACE_WITH_BING_CODE" />
```

Meta-tag verification is the easiest method — no file uploads needed, no DNS changes. Both Google and Bing accept it.

### 4. Add a brief `SEO_SETUP.md` doc

A short markdown file in repo root with the exact step-by-step for both consoles, so you (or anyone else) can re-run setup without searching.

---

## How you'll submit after the code is live

**Google Search Console** (https://search.google.com/search-console)
1. Add property → URL prefix → `https://clearlyledger.com`
2. Pick "HTML tag" verification → copy the content value → paste into `index.html` where I left the placeholder → publish → click Verify.
3. Once verified: Sitemaps → Add a new sitemap → enter `sitemap.xml` → Submit.
4. URL Inspection → paste your homepage URL → Request indexing (do this for `/`, `/pricing`, `/features`, `/blog`).

**Bing Webmaster Tools** (https://www.bing.com/webmasters)
1. Add site → `https://clearlyledger.com`
2. Choose "Add a meta tag to the default page" → copy the content value → paste into `index.html` placeholder → publish → Verify.
3. **Easier shortcut**: Bing has an "Import from Google Search Console" option that copies your verified site + sitemap in one click. Use it after step 1 of GSC is done.
4. Sitemaps → Submit sitemap → `https://clearlyledger.com/sitemap.xml`.

**Other useful submissions** (optional)
- **IndexNow** (Bing/Yandex/Seznam instant indexing): one POST per URL change. Bing auto-enables if you import from Search Console.
- **Schema.org structured data**: your blog posts could benefit from `Article` schema and your homepage from `Organization` + `SoftwareApplication`. Tell me if you want me to add those — separate task.

## Technical details

- All URLs use the canonical `clearlyledger.com` (no `www`, https only).
- Private routes (`/dashboard`, `/login`, `/signup`, `/upgrade/*`, `/checkout/*`, `/admin/*`, password reset) stay out of the sitemap and stay disallowed in robots.txt.
- After publish, both files are reachable at `https://clearlyledger.com/sitemap.xml` and `https://clearlyledger.com/robots.txt` (Vite serves `public/` at root).
- Frontend changes need a click on **Update** in the publish dialog before search engines can fetch them.
