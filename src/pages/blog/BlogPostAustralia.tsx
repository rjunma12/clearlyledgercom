import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import TableOfContents from "@/components/blog/TableOfContents";
import AuthorSection from "@/components/blog/AuthorSection";
import ShareButtons from "@/components/blog/ShareButtons";
import ReadingProgress from "@/components/blog/ReadingProgress";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Convert Australian Bank Statement PDFs to Excel - CBA, ANZ, Westpac, NAB & More",
  "description": "Complete guide to converting Australian bank statements to Excel. Covers Commonwealth Bank, ANZ, Westpac, NAB, ING, Macquarie with MYOB and Xero compatibility.",
  "author": {
    "@type": "Person",
    "name": "ClearlyLedger Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ClearlyLedger",
    "url": "https://clearlyledger.com"
  },
  "datePublished": "2025-01-23",
  "dateModified": "2025-01-23",
  "mainEntityOfPage": "https://clearlyledger.com/blog/australia-bank-statement-converter",
  "about": [
    { "@type": "Thing", "name": "Australian Banking" },
    { "@type": "Thing", "name": "PDF to Excel Conversion" },
    { "@type": "Thing", "name": "Financial Data Processing" }
  ],
  "mentions": [
    { "@type": "Organization", "name": "Commonwealth Bank of Australia" },
    { "@type": "Organization", "name": "ANZ Bank" },
    { "@type": "Organization", "name": "Westpac" },
    { "@type": "Organization", "name": "National Australia Bank" },
    { "@type": "Organization", "name": "ING Australia" },
    { "@type": "Organization", "name": "Macquarie Bank" },
    { "@type": "Organization", "name": "Bendigo Bank" },
    { "@type": "SoftwareApplication", "name": "MYOB" },
    { "@type": "SoftwareApplication", "name": "Xero" }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clearlyledger.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clearlyledger.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Australia Bank Statement Converter", "item": "https://clearlyledger.com/blog/australia-bank-statement-converter" }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I convert a CBA bank statement to Excel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Upload your Commonwealth Bank PDF statement to ClearlyLedger. The tool automatically detects the CBA format, extracts transactions with DD/MM/YYYY dates and AUD amounts, and exports to Excel or CSV format compatible with MYOB and Xero."
      }
    },
    {
      "@type": "Question",
      "name": "Can I convert ANZ bank statements to CSV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ClearlyLedger supports ANZ bank statements including their merged debit/credit format with DR/CR indicators. Upload your ANZ PDF and export to CSV with properly separated debit and credit columns."
      }
    },
    {
      "@type": "Question",
      "name": "Is the converter compatible with MYOB?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ClearlyLedger offers a dedicated MYOB export format with DD/MM/YYYY dates, separate debit/credit columns, and Co./Last Name fields that import directly into MYOB AccountRight and Essentials."
      }
    },
    {
      "@type": "Question",
      "name": "How do BSB numbers appear in the export?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BSB numbers (XXX-XXX format) are preserved in the exported data. ClearlyLedger recognises Australian bank identifiers and maintains the standard 6-digit BSB format in your Excel or CSV output."
      }
    }
  ]
};

const BlogPostAustralia = () => {
  const shareUrl = "https://clearlyledger.com/blog/australia-bank-statement-converter";
  const shareTitle = "Convert Australian Bank Statement PDFs to Excel - CBA, ANZ, Westpac, NAB & More";

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Helmet>
        <title>Convert Australian Bank Statement PDFs to Excel - CBA, ANZ, Westpac, NAB | ClearlyLedger</title>
        <meta name="description" content="Convert CBA, ANZ, Westpac, NAB, ING and Macquarie bank statements to Excel. MYOB and Xero compatible exports with DD/MM/YYYY dates and AUD formatting." />
        <meta name="keywords" content="CBA bank statement to Excel, ANZ PDF to CSV converter, Westpac statement Excel, NAB bank statement converter, Australian bank statement to Excel, MYOB bank import, Xero bank statement, convert CommBank statement, Macquarie statement Excel" />
        <link rel="canonical" href="https://clearlyledger.com/blog/australia-bank-statement-converter" />
        <meta property="og:title" content="Convert Australian Bank Statement PDFs to Excel - CBA, ANZ, Westpac, NAB" />
        <meta property="og:description" content="Free guide to converting Australian bank statements from CBA, ANZ, Westpac, NAB to Excel. MYOB and Xero compatible." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://clearlyledger.com/blog/australia-bank-statement-converter" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      
      <Navbar />
      
      <article className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-foreground">Australia Bank Statement Converter</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">Regional</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Convert Australian Bank Statement PDFs to Excel - CBA, ANZ, Westpac, NAB & More
            </h1>
            {/* Clean SEO-optimized metadata line - no icons */}
            <p className="text-sm text-muted-foreground">
              By ClearlyLedger Team · January 23, 2025 · 7 min read
            </p>
          </header>

          <ShareButtons url={shareUrl} title={shareTitle} />
          
          <TableOfContents h2Only />

          {/* TL;DR Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">TL;DR</h2>
            <p className="text-muted-foreground">
              Australian bank statements from CBA, ANZ, Westpac, NAB, ING, Macquarie, and Bendigo Bank use DD/MM/YYYY dates, AUD currency, and BSB numbers (XXX-XXX format). ClearlyLedger automatically recognises these formats and exports to MYOB and Xero-compatible CSV files—all processed locally in your browser for privacy.
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg blog-prose dark:prose-invert max-w-none">
            <h2 id="why-convert-australian-statements">Why Convert Australian Bank Statements to Excel?</h2>
            <p>
              Australian businesses, accountants, and individuals regularly need to convert bank statement PDFs to Excel for BAS lodgements, tax returns, loan applications, or business bookkeeping. Each of Australia's Big Four banks (and beyond) uses different PDF formats, making universal conversion challenging.
            </p>
            <p>
              ClearlyLedger automatically recognises statements from all major Australian banks and extracts transaction data with proper AUD currency handling, BSB preservation, and DD/MM/YYYY date formatting.
            </p>

            <h2 id="major-australian-banks">Major Australian Banks Supported</h2>
            <p>Our converter handles statements from all major Australian financial institutions:</p>
            
            <h3 id="cba">Commonwealth Bank (CBA)</h3>
            <p>
              As Australia's largest retail bank, CommBank statements feature detailed transaction descriptions, NetBank references, and BPAY details. ClearlyLedger handles CBA's multi-page layouts including statements from everyday accounts, savings accounts, and business accounts.
            </p>
            <p>
              <strong>Key features:</strong> DD MMM YYYY date format, separate debit/credit columns, SWIFT code CTBAAU2S detection.
            </p>

            <h3 id="anz">ANZ Bank</h3>
            <p>
              ANZ statements often use a merged amount column with DR/CR indicators rather than separate debit and credit columns. ClearlyLedger automatically detects this format and splits transactions into proper debit and credit fields for your Excel export.
            </p>
            <p>
              <strong>Key features:</strong> Merged amount handling, DR/CR indicator parsing, Internet Banking reference preservation.
            </p>

            <h3 id="westpac">Westpac</h3>
            <p>
              Westpac Banking Corporation statements (including St.George, Bank of Melbourne, and BankSA subsidiaries) use DD MMM YY date formats. Our converter handles all Westpac Group statement variations seamlessly.
            </p>
            <p>
              <strong>Key features:</strong> DD MMM YY dates, subsidiary bank support, comprehensive reference number extraction.
            </p>

            <h3 id="nab">National Australia Bank (NAB)</h3>
            <p>
              NAB statements use "Withdrawals" and "Deposits" column headers instead of the traditional "Debit" and "Credit" labels. ClearlyLedger maps these to standard accounting columns for compatibility with MYOB and Xero.
            </p>
            <p>
              <strong>Key features:</strong> Withdrawals/Deposits column mapping, UBank support, NAB Connect references.
            </p>

            <h3 id="ing">ING Australia</h3>
            <p>
              ING's digital-first approach produces clean PDF statements with signed amounts (negative for debits). ClearlyLedger converts these to separate debit/credit columns as required by most accounting software.
            </p>
            <p>
              <strong>Key features:</strong> Signed amount conversion, Orange Everyday and Savings Maximiser support.
            </p>

            <h3 id="macquarie">Macquarie Bank</h3>
            <p>
              Macquarie Bank statements from Cash Management Accounts (CMA) and transaction accounts include detailed reference fields. ClearlyLedger preserves these while formatting data for accounting import.
            </p>
            <p>
              <strong>Key features:</strong> CMA statement support, detailed reference preservation, SWIFT code MACQAU2S detection.
            </p>

            <h3 id="bendigo">Bendigo Bank</h3>
            <p>
              Bendigo and Adelaide Bank statements, including Community Bank branches, use standard Australian formats. ClearlyLedger handles both personal and business statement layouts.
            </p>
            <p>
              <strong>Key features:</strong> Community Bank support, Adelaide Bank compatibility, regional branch details.
            </p>

            <h2 id="australian-format-challenges">Australian Format Challenges</h2>
            <p>Converting Australian bank statements involves handling several region-specific formats:</p>
            <ul>
              <li><strong>AUD Currency:</strong> Proper handling of the dollar sign ($) with comma thousands separators (1,234.56)</li>
              <li><strong>BSB Numbers:</strong> Preservation of 6-digit Bank-State-Branch codes in XXX-XXX format</li>
              <li><strong>Date Formats:</strong> DD/MM/YYYY and DD MMM YYYY formats used by all Australian banks</li>
              <li><strong>Payment References:</strong> BPAY, PayID, Osko, and Direct Debit references</li>
              <li><strong>Account Numbers:</strong> 6-10 digit account numbers following BSB codes</li>
            </ul>

            <h2 id="myob-xero-compatibility">MYOB and Xero Compatibility</h2>
            <p>
              Australian businesses predominantly use MYOB and Xero for accounting. ClearlyLedger provides dedicated export formats for both:
            </p>
            
            <h3>MYOB Export Format</h3>
            <ul>
              <li>DD/MM/YYYY date format (Australian standard)</li>
              <li>Separate Debit Amount and Credit Amount columns</li>
              <li>Co./Last Name field for payee details</li>
              <li>Compatible with MYOB AccountRight and Essentials</li>
              <li>Import via File → Import Data → Bank Statement</li>
            </ul>

            <h3>Xero Export Format</h3>
            <ul>
              <li>DD/MM/YYYY date format</li>
              <li>Signed Amount column (negative for debits)</li>
              <li>Payee and Description fields</li>
              <li>Reference column for reconciliation</li>
              <li>Import via Settings → Bank Accounts → Import a Statement</li>
            </ul>

            <h2 id="privacy-compliance">Privacy Act Compliance</h2>
            <p>
              The Australian Privacy Act 1988 and the Australian Privacy Principles (APPs) require careful handling of personal financial data. ClearlyLedger addresses this by:
            </p>
            <ul>
              <li>Processing all data locally in your browser—no server uploads</li>
              <li>Optional PII masking for account numbers and BSB codes</li>
              <li>No data retention or storage of your bank statements</li>
              <li>Complete transparency in how your data is processed</li>
              <li>No third-party data sharing or analytics on your documents</li>
            </ul>

            <h2 id="comparison-table">Tool Comparison for Australian Bank Statements</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Feature</th>
                    <th className="text-left p-2 border-b">ClearlyLedger</th>
                    <th className="text-left p-2 border-b">Generic Converters</th>
                    <th className="text-left p-2 border-b">Manual Entry</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b">Australian Bank Detection</td>
                    <td className="p-2 border-b text-primary">✓ Automatic (7 banks)</td>
                    <td className="p-2 border-b">Limited</td>
                    <td className="p-2 border-b">N/A</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">BSB Number Handling</td>
                    <td className="p-2 border-b text-primary">✓ Preserved</td>
                    <td className="p-2 border-b">Often Lost</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">MYOB Export</td>
                    <td className="p-2 border-b text-primary">✓ Native Format</td>
                    <td className="p-2 border-b">Manual Mapping</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Xero Export</td>
                    <td className="p-2 border-b text-primary">✓ Native Format</td>
                    <td className="p-2 border-b">Manual Mapping</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">DD/MM/YYYY Dates</td>
                    <td className="p-2 border-b text-primary">✓ Default</td>
                    <td className="p-2 border-b">Often MM/DD/YYYY</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Balance Verification</td>
                    <td className="p-2 border-b text-primary">✓ Automatic</td>
                    <td className="p-2 border-b">Rare</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Local Processing</td>
                    <td className="p-2 border-b text-primary">✓ Browser-Only</td>
                    <td className="p-2 border-b">Cloud Upload</td>
                    <td className="p-2 border-b">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 id="how-to-convert">How to Convert Your Australian Bank Statement</h2>
            <ol>
              <li><strong>Upload your PDF:</strong> Drag and drop your statement from CBA, ANZ, Westpac, NAB, or any Australian bank</li>
              <li><strong>Automatic Detection:</strong> ClearlyLedger identifies the bank format using BSB patterns and applies bank-specific parsing rules</li>
              <li><strong>Review Extracted Data:</strong> Preview the transactions, dates (DD/MM/YYYY), amounts (AUD), and references before export</li>
              <li><strong>Choose Export Format:</strong> Select MYOB, Xero, or standard Excel/CSV format</li>
              <li><strong>Download:</strong> Get your structured data ready for import into your accounting software</li>
            </ol>

            <h2 id="common-use-cases">Common Use Cases in Australia</h2>
            <ul>
              <li><strong>BAS Lodgements:</strong> Extract transaction data for quarterly Business Activity Statements</li>
              <li><strong>Tax Returns:</strong> Prepare financial records for individual or business tax returns</li>
              <li><strong>Loan Applications:</strong> Organise bank statements for mortgage or business loan applications</li>
              <li><strong>MYOB Bookkeeping:</strong> Import transactions directly into MYOB AccountRight or Essentials</li>
              <li><strong>Xero Bank Feeds:</strong> Supplement Xero bank feeds with historical statement data</li>
              <li><strong>Expense Claims:</strong> Track business expenses for ABN holders and contractors</li>
              <li><strong>Audit Preparation:</strong> Create clean financial records for ATO audits</li>
            </ul>

            <h2 id="faq">Frequently Asked Questions</h2>
            
            <h3>How do I convert a CBA bank statement to Excel?</h3>
            <p>
              Upload your Commonwealth Bank PDF statement to ClearlyLedger. The tool automatically detects the CBA format, extracts transactions with DD/MM/YYYY dates and AUD amounts, and exports to Excel or CSV format compatible with MYOB and Xero.
            </p>

            <h3>Can I convert ANZ bank statements to CSV?</h3>
            <p>
              Yes. ClearlyLedger supports ANZ bank statements including their merged debit/credit format with DR/CR indicators. Upload your ANZ PDF and export to CSV with properly separated debit and credit columns.
            </p>

            <h3>Is the converter compatible with MYOB?</h3>
            <p>
              Yes. ClearlyLedger offers a dedicated MYOB export format with DD/MM/YYYY dates, separate debit/credit columns, and Co./Last Name fields that import directly into MYOB AccountRight and Essentials.
            </p>

            <h3>How do BSB numbers appear in the export?</h3>
            <p>
              BSB numbers (XXX-XXX format) are preserved in the exported data. ClearlyLedger recognises Australian bank identifiers and maintains the standard 6-digit BSB format in your Excel or CSV output.
            </p>

            <h2 id="key-takeaways">Key Takeaways</h2>
            <ul>
              <li><strong>All major Australian banks supported:</strong> CBA, ANZ, Westpac, NAB, ING, Macquarie, and Bendigo</li>
              <li><strong>MYOB and Xero-ready exports:</strong> Native formats for Australian accounting software</li>
              <li><strong>DD/MM/YYYY date format:</strong> Australian date conventions preserved correctly</li>
              <li><strong>BSB numbers maintained:</strong> Bank identifiers preserved in XXX-XXX format</li>
              <li><strong>Privacy Act compliant:</strong> Local browser processing, no data uploaded</li>
            </ul>
            <p>
              Start converting your Australian bank statements today. <Link to="/" className="text-primary hover:underline">Try free conversion</Link>.
            </p>
          </div>

          <AuthorSection />

          {/* CTA Section */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Ready to Convert Your Australian Bank Statement?
            </h2>
            <p className="text-muted-foreground mb-6">
              Upload your CBA, ANZ, Westpac, NAB, or any Australian bank statement and get MYOB or Xero-compatible output in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button variant="hero">Upload Your PDF</Button>
              </Link>
              <Link to="/features">
                <Button variant="glass">View All Features</Button>
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-foreground mb-6">Related Articles</h3>
            <div className="grid gap-4">
              <Link to="/blog/uk-bank-statement-converter" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Convert UK Bank Statement PDFs to Excel - Barclays, HSBC, Lloyds & More</h4>
                <p className="text-sm text-muted-foreground">Guide for British bank statements with UK GDPR compliance.</p>
              </Link>
              <Link to="/blog/privacy-secure-bank-statement-conversion" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Bank Statement Conversion: Ensuring Privacy & Secure Processing</h4>
                <p className="text-sm text-muted-foreground">Learn about privacy-first conversion practices for sensitive financial data.</p>
              </Link>
              <Link to="/blog/convert-bank-statements-to-excel" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">How to Convert Bank Statement PDFs to Excel (Step-by-Step Guide)</h4>
                <p className="text-sm text-muted-foreground">Complete tutorial for converting any bank statement to Excel.</p>
              </Link>
            </div>
          </div>

          {/* Back Link */}
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

export default BlogPostAustralia;
