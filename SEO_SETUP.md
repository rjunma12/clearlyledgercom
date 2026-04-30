# SEO Setup — Search Console & Bing Webmaster

Files in this repo:
- `public/sitemap.xml` — 27 public URLs, served at `https://clearlyledger.com/sitemap.xml`
- `public/robots.txt` — crawler rules + sitemap reference
- `index.html` — contains two verification meta-tag placeholders

## 1. Google Search Console

1. Go to https://search.google.com/search-console
2. **Add property → URL prefix** → enter `https://clearlyledger.com`
3. Pick **HTML tag** verification. Copy the `content="..."` value.
4. In `index.html`, replace `REPLACE_WITH_GOOGLE_CODE` with that value.
5. Click **Publish → Update** in Lovable to push the change live.
6. Back in Search Console, click **Verify**.
7. Left menu → **Sitemaps** → enter `sitemap.xml` → **Submit**.
8. **URL Inspection** → paste `https://clearlyledger.com/` → **Request Indexing**.
   Repeat for `/pricing`, `/features`, `/blog`.

## 2. Bing Webmaster Tools

Two paths — pick one:

### Easy path (after Google is verified)
1. Go to https://www.bing.com/webmasters
2. Click **Import from Google Search Console** → sign in with the same Google account → select `clearlyledger.com`. Bing copies your verified site and sitemap automatically.

### Manual path
1. **Add a site** → enter `https://clearlyledger.com`
2. Choose **Meta tag** verification. Copy the `content="..."` value.
3. In `index.html`, replace `REPLACE_WITH_BING_CODE` with that value.
4. **Publish → Update**, then click **Verify** in Bing.
5. Left menu → **Sitemaps** → submit `https://clearlyledger.com/sitemap.xml`.

## 3. Optional but recommended

- **IndexNow** (instant indexing for Bing/Yandex): auto-enabled if you imported from Search Console.
- **Schema.org structured data**: add `Article` schema to blog posts and `Organization` + `SoftwareApplication` to the homepage. Ask in chat to add these.
- **Re-submit sitemap** any time you publish new blog posts. Update `<lastmod>` dates in `public/sitemap.xml` to nudge re-crawls.

## Notes

- Frontend changes only go live after clicking **Update** in the publish dialog.
- All URLs use the canonical `clearlyledger.com` (no `www`). If you ever add `www`, set up a 301 redirect to the apex.
- Private routes (`/dashboard`, `/login`, `/signup`, `/upgrade/*`, `/checkout/*`, `/admin/*`) are excluded from the sitemap and disallowed in robots.txt.
