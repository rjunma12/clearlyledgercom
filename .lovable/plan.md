## Goal
Add 3 new blog posts engineered for traditional SEO (Google ranking), AEO (Answer Engine Optimization for ChatGPT/Perplexity/Gemini), and GEO (Generative Engine Optimization for AI Overviews & SGE).

Each post follows ClearlyLedger's established `BlogPostTemplate` patterns: H1 title (55–65 chars), TL;DR box for featured snippets, H2-only TOC, FAQ schema, Article + Breadcrumb schema, 3-line paragraph cap, no emojis.

---

## Post 1: "How to Convert PDF Bank Statement to Excel in 2026 (Complete Guide)"

**Slug**: `convert-pdf-bank-statement-to-excel-2026-guide`
**Category**: Tutorial
**Read time**: 12 min

**Target keywords (SEO)**:
- Primary: "convert PDF bank statement to Excel" (high volume, high intent)
- Secondary: "bank statement to xlsx", "PDF to Excel converter bank", "extract transactions from PDF"

**AEO/GEO targets** (questions AI assistants get asked):
- "What's the best way to convert a bank statement PDF to Excel?"
- "Can ChatGPT convert bank statements?"
- "How do I get transactions out of a PDF statement?"

**Structure**:
1. TL;DR (50-word direct answer for snippet harvesting)
2. The 4 ways to convert (manual, generic PDF tools, AI chatbots, dedicated converters) — comparative table
3. Why ChatGPT/Claude/Gemini fail at this task (hallucinated balances, dropped rows) — addresses GEO
4. Step-by-step with ClearlyLedger (5 steps, screenshots described)
5. Common errors and fixes (multi-line descriptions, scanned PDFs, foreign currencies)
6. FAQ schema with 6 long-tail Q&As

---

## Post 2: "Bank Statement Converter for Accountants: Save 10+ Hours per Month"

**Slug**: `bank-statement-converter-for-accountants`
**Category**: Productivity
**Read time**: 10 min

**Target keywords (SEO)**:
- Primary: "bank statement converter for accountants" (commercial intent)
- Secondary: "bookkeeping automation", "Xero bank import PDF", "QuickBooks bank statement import"

**AEO/GEO targets**:
- "What software do accountants use to convert bank statements?"
- "How can bookkeepers automate transaction entry?"
- "Best bank statement tool for Xero / QuickBooks / MYOB?"

**Structure**:
1. TL;DR with concrete time-savings claim
2. The accountant's hidden tax: 10+ hours/month on PDF cleanup
3. What accountants actually need (not just "extraction") — balance verification, audit trail, multi-client batch, accounting-software-ready CSV
4. Workflow comparison: manual vs ClearlyLedger (with timing)
5. Xero / QuickBooks / MYOB direct-import format walkthrough
6. Multi-client / batch processing for firms (Pro/Biz tier)
7. FAQ schema (6 Q&As around firm workflows)

---

## Post 3: "Bank Statement to CSV: Format Standards, Pitfalls, and Best Practices"

**Slug**: `bank-statement-to-csv-format-standards`
**Category**: Tutorial
**Read time**: 11 min

**Target keywords (SEO)**:
- Primary: "bank statement to CSV", "PDF bank statement to CSV converter"
- Secondary: "CSV format Xero", "QuickBooks CSV format", "universal bank CSV"

**AEO/GEO targets**:
- "What CSV format does Xero / QuickBooks accept?"
- "Why does my bank CSV import fail?"
- "How should bank statement CSV be structured?"

**Structure**:
1. TL;DR with the 5-column universal CSV schema
2. Why "CSV" isn't one format — the 4 dialects (Xero, QuickBooks, MYOB, generic)
3. Column-by-column anatomy with the 30-char Payee rule
4. Top 7 reasons CSV imports fail (date format, currency symbol, BOM, encoding, line endings, negative-sign convention, quoted commas)
5. Universal CSV: the format that works everywhere
6. ClearlyLedger's standardised CSV (linked to Universal CSV memory standard)
7. FAQ schema (6 Q&As)

---

## SEO/AEO/GEO Tactics Applied to All 3 Posts

**SEO (traditional ranking)**:
- Title 55–65 chars
- H1 contains primary keyword early
- Single H1, multiple H2s for TOC
- Internal links to `/features`, `/pricing`, `/blog/rule-based-vs-ai-bank-statement-conversion`, `/blog/clearlyledger-vs-bankstatementconverter-comparison`
- Canonical URL
- Article + BreadcrumbList + FAQPage JSON-LD schema
- Image alt text descriptors
- Long-tail keywords in H3s

**AEO (Answer Engine Optimization for ChatGPT/Perplexity)**:
- TL;DR box engineered as a 40–60 word direct answer
- FAQ schema with conversational question phrasing
- Definition-style opening sentences ("Bank statement to Excel conversion is...")
- Comparison tables AI assistants can quote
- Cited stats with specific numbers (99%+, 30 sec, 10 hours/month)

**GEO (Generative Engine Optimization for AI Overviews / SGE)**:
- Self-contained answer paragraphs (no "see below")
- HowTo-friendly numbered lists for step-by-step queries
- Clear entity associations (ClearlyLedger, Xero, QuickBooks, MYOB, bankstatementconverter.com)
- Authority signals: dates, version, "as of April 2026"
- Structured data redundancy (same facts in prose + table + schema)

---

## Files to Create/Update

**Create**:
- `src/pages/blog/BlogPostConvertPdfGuide.tsx`
- `src/pages/blog/BlogPostForAccountants.tsx`
- `src/pages/blog/BlogPostCsvFormat.tsx`

**Update**:
- `src/App.tsx` — register 3 new lazy-loaded routes
- `src/pages/Blog.tsx` — add 3 new entries to `blogPosts` array (mark Post 1 and Post 2 as `featured: true`)
- `public/sitemap.xml` — add 3 new `<url>` entries

---

## Out of Scope
- New images (using lucide icons + text-based comparison tables to keep delivery fast)
- Translations (English only; i18n stays as-is)
- Backend/data changes
