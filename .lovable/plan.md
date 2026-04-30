## Goal

Convert the uploaded `clearlyledger_blog.html` ("How to Convert a Bank Statement PDF to Excel in Seconds — Any Bank, Any Country") into a project-compatible React blog post, register it in routing/listing/sitemap, and publish.

## Approach

Reuse the existing post pattern (e.g. `BlogPostCsvFormat.tsx`) so the new article inherits site styling (Navbar, Footer, blog typography, ReadingProgress, ShareButtons, AuthorSection, TableOfContents) instead of porting the raw HTML/CSS. Content stays faithful to the upload but is rewritten in semantic JSX with Tailwind/prose classes.

## Slug & metadata

- **Slug**: `/blog/convert-bank-statement-pdf-to-excel-any-bank`
- **Title**: "Convert Bank Statement PDF to Excel in Seconds — Any Bank, Any Country"
- **Category**: Tutorial
- **Read time**: 8 min · Date: April 30, 2026
- **Featured**: true
- **Keywords**: bank statement PDF to Excel, convert bank statement to Excel, bank statement converter, PDF bank statement to CSV, bank statement to spreadsheet, bank PDF converter, convert bank statement online, bank statement data extraction
- **TL;DR + FAQPage + Article + Breadcrumb JSON-LD** schemas

## Content sections (from upload, adapted)

1. Intro + 3-stat strip (10hrs / 99%+ / <60s) rendered as styled cards
2. Why you can't copy-paste from a PDF
3. The 3 common approaches (manual / generic / purpose-built)
4. Step-by-step conversion (numbered steps)
5. Which banks does it work with (known + unknown/AI)
6. Excel vs CSV comparison table
7. Privacy & safety checklist
8. Scanned statements / OCR
9. FAQ (6 Qs — also in FAQPage schema)
10. Who uses it (audience list)
11. Final CTA → `/` and `/pricing`

Memory compliance: keep "AI-assisted 99%+ accuracy" framing, no "we don't train models" language, helppropsal@outlook.com only if contact mentioned, no emojis in body headings (replace ❌/✅ with text labels), respect blog formatting standard (H2 TOC, ≤3-line paragraphs, no emojis).

## Files

**Create**
- `src/pages/blog/BlogPostAnyBankAnyCountry.tsx` — new post component modeled on `BlogPostCsvFormat.tsx`.

**Edit**
- `src/App.tsx` — lazy import + `<Route path="/blog/convert-bank-statement-pdf-to-excel-any-bank" …>`.
- `src/pages/Blog.tsx` — prepend new entry to `blogPosts` array (featured, Tutorial).
- `public/sitemap.xml` — add `<url>` entry for the new slug (priority 0.9, weekly).

No DB, no edge function, no env changes.

## Verification

After build: confirm route renders, TOC populates from H2s, FAQ schema validates structurally, sitemap remains well-formed XML.
