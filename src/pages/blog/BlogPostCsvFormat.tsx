import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import AuthorSection from "@/components/blog/AuthorSection";
import TableOfContents from "@/components/blog/TableOfContents";

const pageUrl = "https://clearlyledger.com/blog/bank-statement-to-csv-format-standards";
const pageTitle = "Bank Statement to CSV: Format Standards and Common Pitfalls";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": pageTitle,
  "description": "Bank statement to CSV conversion looks simple but breaks at import. Learn the 4 CSV dialects, the 7 most common import failures, and the universal schema that works in Xero, QuickBooks, and MYOB.",
  "author": { "@type": "Organization", "name": "ClearlyLedger", "url": "https://clearlyledger.com" },
  "publisher": {
    "@type": "Organization",
    "name": "ClearlyLedger",
    "logo": { "@type": "ImageObject", "url": "https://clearlyledger.com/logo.png" }
  },
  "datePublished": "2026-04-30",
  "dateModified": "2026-04-30",
  "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clearlyledger.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clearlyledger.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Bank Statement to CSV Standards", "item": pageUrl }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What CSV format does Xero accept for bank statements?",
      "acceptedAnswer": { "@type": "Answer", "text": "Xero accepts a CSV with Date (DD/MM/YYYY), Amount (signed, negative for debits), Payee (30 characters max), Description, and Reference columns. The file must be UTF-8 without BOM, comma-delimited, with quoted fields where commas appear in the description." }
    },
    {
      "@type": "Question",
      "name": "Why does my bank statement CSV import fail?",
      "acceptedAnswer": { "@type": "Answer", "text": "The seven most common causes are: wrong date format, currency symbol embedded in amount, UTF-8 BOM at the start, wrong line endings, wrong negative-sign convention (parentheses vs minus), unquoted commas in descriptions, and exceeding the platform's column-length limits. ClearlyLedger handles all seven automatically." }
    },
    {
      "@type": "Question",
      "name": "What's the difference between QuickBooks and Xero CSV formats?",
      "acceptedAnswer": { "@type": "Answer", "text": "QuickBooks Online accepts either a single signed Amount column or separate Debit/Credit columns. Xero requires a single signed Amount with negative for debits. QuickBooks is more lenient on date format; Xero requires DD/MM/YYYY in most regions. Field names also differ." }
    },
    {
      "@type": "Question",
      "name": "Is there a universal CSV format that works everywhere?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — a 5-column schema (Date, Description, Debit, Credit, Balance) in UTF-8, comma-delimited, ISO-8601 dates (YYYY-MM-DD), with no currency symbols and quoted fields where commas appear. ClearlyLedger's universal CSV uses this schema and works as input to virtually any pipeline or accounting tool." }
    },
    {
      "@type": "Question",
      "name": "Should the CSV include the running balance?",
      "acceptedAnswer": { "@type": "Answer", "text": "For accounting-software import, no — most platforms ignore or reject a balance column because they recompute it. For analysis and reconciliation, yes — the running balance is essential for verifying the math. ClearlyLedger emits balance for analysis CSV and omits it for accounting-software CSV." }
    },
    {
      "@type": "Question",
      "name": "What encoding should bank statement CSVs use?",
      "acceptedAnswer": { "@type": "Answer", "text": "UTF-8 without BOM is the safe default. UTF-8 with BOM breaks several import paths (notably older QuickBooks Desktop). Windows-1252 should be avoided because it loses non-Latin characters in Payee fields." }
    }
  ]
};

const BlogPostCsvFormat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle} | ClearlyLedger Blog</title>
        <meta name="description" content="Bank statement to CSV conversion: the 4 CSV dialects, the 7 most common import failures, and the universal schema that works in Xero, QuickBooks, and MYOB." />
        <meta name="keywords" content="bank statement to CSV, PDF bank statement to CSV converter, CSV format Xero, QuickBooks CSV format, MYOB CSV import, universal bank CSV schema" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="The CSV format standards that determine whether your bank statement import succeeds or fails." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <ReadingProgress />
      <Navbar />

      <article className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-foreground">CSV Format Standards</span>
          </nav>

          <header className="mb-12">
            <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">Tutorial</span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight">
              Bank Statement to CSV: Format Standards and Common Pitfalls
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              By ClearlyLedger Team · April 30, 2026 · 11 min read
            </p>
            <ShareButtons url={pageUrl} title={pageTitle} />
          </header>

          <TableOfContents contentSelector="article" h2Only />

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              TL;DR
            </h2>
            <p className="text-muted-foreground">
              "CSV" is not one format — there are at least four dialects (Xero, QuickBooks, MYOB, generic). Most import failures come from one of seven causes: wrong date format, currency symbol in amount, UTF-8 BOM, wrong line endings, wrong negative-sign convention, unquoted commas, or column-length limits. The universal 5-column schema (Date, Description, Debit, Credit, Balance) imports cleanly almost anywhere.
            </p>
          </div>

          <div className="prose prose-lg blog-prose max-w-none dark:prose-invert">
            <section>
              <p className="lead text-xl text-muted-foreground mb-6">
                Converting a bank statement PDF to CSV looks like a solved problem until you try to import the file. Then half of them fail with cryptic errors and you spend an afternoon shaping spreadsheets by hand.
              </p>
              <p>
                This guide breaks down what "bank statement CSV" actually means in 2026, why imports fail, and the schema that works across Xero, QuickBooks, MYOB, and custom pipelines.
              </p>
            </section>

            <section>
              <h2 id="csv-not-one-format">"CSV" Is Not One Format — It's Four Dialects</h2>
              <p>
                The CSV file extension just means "text separated by commas". The shape of the data inside is dictated by whoever consumes it. The four dialects you'll encounter:
              </p>
              <ul>
                <li><strong>Xero CSV.</strong> Date, Amount (signed), Payee (max 30 chars), Description, Reference. UTF-8, no BOM.</li>
                <li><strong>QuickBooks CSV.</strong> Date, Description, Amount — or separate Debit and Credit columns. More flexible than Xero on date format.</li>
                <li><strong>MYOB CSV.</strong> Date, Amount, Description. Australia-centric date and currency conventions.</li>
                <li><strong>Generic / universal CSV.</strong> Date, Description, Debit, Credit, Balance — the analysis-friendly shape.</li>
              </ul>
              <p>
                A converter that emits "a CSV" without specifying which dialect is gambling that the import works.
              </p>
            </section>

            <section>
              <h2 id="anatomy">Column-by-Column Anatomy</h2>
              <p>
                A clean bank statement CSV has consistent rules for every column. The rules that matter most:
              </p>
              <ul>
                <li><strong>Date.</strong> Use ISO-8601 (YYYY-MM-DD) for universal CSV; DD/MM/YYYY for Xero in most regions; MM/DD/YYYY for QuickBooks US. Never mix formats within a file.</li>
                <li><strong>Description.</strong> No embedded line breaks. Quote the field if it contains a comma. Multi-line descriptions in the source PDF should be stitched into one line.</li>
                <li><strong>Payee.</strong> Where required (Xero), truncate to 30 characters, prioritising the merchant name over the reference number.</li>
                <li><strong>Amount.</strong> Numeric only. No currency symbol (use a separate column if needed). Negative for debits in signed-amount schemas. Two decimal places.</li>
                <li><strong>Balance.</strong> Required for analysis CSV. Omit for accounting-software import (the platform recomputes it).</li>
              </ul>
            </section>

            <section>
              <h2 id="seven-failures">The 7 Reasons CSV Imports Fail</h2>
              <p>
                Almost every "my CSV won't import" support ticket comes down to one of these.
              </p>
              <ol>
                <li><strong>Wrong date format.</strong> A US-format date in a UK-region Xero account silently swaps day and month.</li>
                <li><strong>Currency symbol in amount.</strong> "$1,234.56" parses as text. Strip symbols and use a separate currency column.</li>
                <li><strong>UTF-8 BOM at file start.</strong> Invisible to humans, breaks header parsing in QuickBooks Desktop and several legacy tools.</li>
                <li><strong>Wrong line endings.</strong> CRLF vs LF matters for some older importers. Use LF (Unix) as the safe default.</li>
                <li><strong>Negative-sign convention.</strong> Accounting exports often use parentheses for negatives: "(123.45)". Most importers expect a minus sign: "-123.45".</li>
                <li><strong>Unquoted commas in descriptions.</strong> "AMAZON.COM, INC" without quotes splits into two columns. Quote any field containing a comma.</li>
                <li><strong>Column-length limits exceeded.</strong> Xero truncates Payee at 30 chars; importers may reject the whole row if the field is longer.</li>
              </ol>
            </section>

            <section>
              <h2 id="universal-csv">The Universal Bank CSV Schema</h2>
              <p>
                For any pipeline that isn't directly importing into a specific accounting platform, a universal schema is the right default. The shape:
              </p>
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
{`Date,Description,Debit,Credit,Balance
2026-01-15,"AMAZON.COM, INC",49.99,,1234.56
2026-01-16,SALARY DEPOSIT,,2500.00,3734.56
2026-01-17,STARBUCKS #1234,4.85,,3729.71`}
              </pre>
              <p>
                Five columns, ISO-8601 dates, separated debit and credit columns (avoids sign-convention disputes), running balance for verification, UTF-8 without BOM, LF line endings, all comma-containing fields quoted. This file imports as analysis input or reshapes trivially into any accounting-platform dialect.
              </p>
            </section>

            <section>
              <h2 id="clearlyledger-csv">How ClearlyLedger Handles CSV Output</h2>
              <p>
                ClearlyLedger emits one of three CSV dialects depending on the export choice:
              </p>
              <ul>
                <li><strong>Universal CSV</strong> — the 5-column schema above, for analysis and custom pipelines.</li>
                <li><strong>Xero / QuickBooks / MYOB CSV</strong> — the platform-specific dialect, with date format, sign convention, and field length conformed to the target.</li>
                <li><strong>Standardised Payee</strong> — merchant name normalised and truncated to 30 chars; reference number preserved in a separate column.</li>
              </ul>
              <p>
                Every CSV passes the same balance verification gate as the Excel export. CSV outputs are gated to the Starter plan and above; the free tier ships full Excel.
              </p>
            </section>

            <section>
              <h2 id="bottom-line">Bottom Line</h2>
              <p>
                If your bank statement CSV is failing to import, the file shape is almost certainly the cause — not the bank, not the importer. Use the universal 5-column schema for analysis, or have your converter emit the platform-specific dialect for direct import.
              </p>
              <p>
                Either way, the converter doing the work needs to know about the seven failure modes and handle them automatically. A "PDF to CSV" tool that doesn't is just generating new data-cleanup work for you.
              </p>
            </section>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">CSV Output That Actually Imports</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Universal, Xero, QuickBooks, and MYOB CSV — all balance-verified, all import-ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/"><Button variant="hero" size="lg">Try Free Converter</Button></Link>
              <Link to="/pricing"><Button variant="outline" size="lg">View Pricing</Button></Link>
            </div>
          </div>

          <AuthorSection />

          <div className="mt-16">
            <h3 className="text-xl font-semibold text-foreground mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/blog/convert-pdf-bank-statement-to-excel-2026-guide" className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">Tutorial</span>
                <h4 className="font-medium text-foreground mt-2">How to Convert PDF Bank Statement to Excel in 2026</h4>
              </Link>
              <Link to="/blog/bank-statement-converter-for-accountants" className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">Productivity</span>
                <h4 className="font-medium text-foreground mt-2">Bank Statement Converter for Accountants</h4>
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostCsvFormat;
