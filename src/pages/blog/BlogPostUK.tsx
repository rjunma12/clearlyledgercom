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
  "headline": "Convert UK Bank Statement PDFs to Excel - Barclays, HSBC, Lloyds & More",
  "description": "Step-by-step guide for converting British bank statements to Excel. Covers Barclays, HSBC, Lloyds, NatWest with UK GDPR compliance.",
  "author": {
    "@type": "Person",
    "name": "ClearlyLedger Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ClearlyLedger",
    "url": "https://clearlyledger.com"
  },
  "datePublished": "2025-01-21",
  "dateModified": "2025-01-21",
  "mainEntityOfPage": "https://clearlyledger.com/blog/uk-bank-statement-converter",
  "about": [
    { "@type": "Thing", "name": "UK Banking" },
    { "@type": "Thing", "name": "PDF to Excel Conversion" }
  ],
  "mentions": [
    { "@type": "Organization", "name": "Barclays" },
    { "@type": "Organization", "name": "HSBC UK" },
    { "@type": "Organization", "name": "Lloyds Banking Group" },
    { "@type": "Organization", "name": "NatWest" },
    { "@type": "Organization", "name": "Santander UK" },
    { "@type": "Organization", "name": "Nationwide Building Society" }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clearlyledger.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clearlyledger.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "UK Bank Statement Converter", "item": "https://clearlyledger.com/blog/uk-bank-statement-converter" }
  ]
};

const BlogPostUK = () => {
  const shareUrl = "https://clearlyledger.com/blog/uk-bank-statement-converter";
  const shareTitle = "Convert UK Bank Statement PDFs to Excel - Barclays, HSBC, Lloyds & More";

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Helmet>
        <title>Convert UK Bank Statement PDFs to Excel - Barclays, HSBC, Lloyds & More | ClearlyLedger</title>
        <meta name="description" content="Step-by-step guide for converting British bank statements to Excel. Covers Barclays, HSBC, Lloyds, NatWest with UK GDPR compliance." />
        <meta name="keywords" content="UK bank statement converter, British bank PDF to Excel, Barclays statement Excel, HSBC statement converter, Lloyds PDF Excel, NatWest statement, Santander UK Excel" />
        <link rel="canonical" href="https://clearlyledger.com/blog/uk-bank-statement-converter" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
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
            <span className="text-foreground">UK Bank Statement Converter</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">Regional</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Convert UK Bank Statement PDFs to Excel - Barclays, HSBC, Lloyds & More
            </h1>
            {/* Clean SEO-optimized metadata line - no icons */}
            <p className="text-sm text-muted-foreground">
              By ClearlyLedger Team · January 21, 2025 · 5 min read
            </p>
          </header>

          <ShareButtons url={shareUrl} title={shareTitle} />
          
          <TableOfContents h2Only />

          {/* TL;DR Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">TL;DR</h2>
            <p className="text-muted-foreground">
              UK bank statements from Barclays, HSBC, Lloyds, NatWest, Santander, and Nationwide require handling GBP formats, sort codes, and DD/MM/YYYY dates. ClearlyLedger processes these locally with full UK GDPR compliance—no data leaves your browser.
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg blog-prose dark:prose-invert max-w-none">
            <h2 id="why-convert-uk-statements">Why Convert UK Bank Statements to Excel?</h2>
            <p>
              UK businesses, accountants, and individuals regularly need to convert bank statement PDFs to Excel for VAT returns, HMRC submissions, mortgage applications, or business accounting. Each British bank uses different PDF formats, making universal conversion challenging.
            </p>
            <p>
              ClearlyLedger automatically recognizes statements from all major UK high street banks and extracts transaction data with proper GBP currency handling.
            </p>

            <h2 id="major-uk-banks">Major UK Banks Supported</h2>
            <p>Our converter handles statements from all major British financial institutions:</p>
            
            <h3 id="barclays">Barclays</h3>
            <p>
              Barclays statements feature detailed transaction descriptions and reference numbers. Our converter handles Barclays' multi-page layouts and preserves all transaction metadata including payment references.
            </p>

            <h3 id="hsbc-uk">HSBC UK</h3>
            <p>
              HSBC UK statements include comprehensive transaction histories with merchant details. ClearlyLedger accurately parses HSBC's format while maintaining data integrity.
            </p>

            <h3 id="lloyds">Lloyds Banking Group</h3>
            <p>
              Lloyds, Halifax, and Bank of Scotland statements share similar formats. Our tool handles all Lloyds Banking Group statement variations seamlessly.
            </p>

            <h3 id="natwest">NatWest / RBS</h3>
            <p>
              NatWest and Royal Bank of Scotland statements feature unique reference formats. ClearlyLedger maps these to clean Excel columns for easy reconciliation.
            </p>

            <h3 id="santander-uk">Santander UK</h3>
            <p>
              Santander UK statements include detailed categorization and timestamps. Our converter preserves these fields when exporting to Excel.
            </p>

            <h3 id="nationwide">Nationwide Building Society</h3>
            <p>
              Nationwide statements feature clean layouts with comprehensive transaction details. ClearlyLedger handles both current account and savings statements.
            </p>

            <h2 id="local-format-challenges">UK Format Challenges</h2>
            <p>Converting British bank statements involves handling several region-specific formats:</p>
            <ul>
              <li><strong>GBP Currency:</strong> Proper handling of the Pound Sterling symbol (£) and thousands separators</li>
              <li><strong>Sort Codes:</strong> Preservation of 6-digit sort codes (XX-XX-XX format)</li>
              <li><strong>Date Formats:</strong> DD/MM/YYYY format used by all UK banks</li>
              <li><strong>Payment References:</strong> Faster Payments, BACS, CHAPS, and Direct Debit references</li>
              <li><strong>Account Numbers:</strong> 8-digit UK account number format</li>
            </ul>

            <h2 id="uk-gdpr-compliance">UK GDPR Compliance & Privacy</h2>
            <p>
              The UK General Data Protection Regulation (UK GDPR) requires strict handling of personal financial data. ClearlyLedger addresses this by:
            </p>
            <ul>
              <li>Processing all data locally in your browser—no server uploads</li>
              <li>Optional PII masking for account numbers and sort codes</li>
              <li>No data retention or storage of your bank statements</li>
              <li>Complete transparency in how your data is processed</li>
              <li>No third-party data sharing</li>
            </ul>

            <h2 id="comparison-table">Tool Comparison for UK Bank Statements</h2>
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
                    <td className="p-2 border-b">UK Bank Recognition</td>
                    <td className="p-2 border-b text-primary">✓ Automatic</td>
                    <td className="p-2 border-b">Limited</td>
                    <td className="p-2 border-b">N/A</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Sort Code Handling</td>
                    <td className="p-2 border-b text-primary">✓ Preserved</td>
                    <td className="p-2 border-b">Often Lost</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">GBP Format Handling</td>
                    <td className="p-2 border-b text-primary">✓ Native</td>
                    <td className="p-2 border-b">Varies</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">UK GDPR Compliant</td>
                    <td className="p-2 border-b text-primary">✓ Local Processing</td>
                    <td className="p-2 border-b">Varies</td>
                    <td className="p-2 border-b">Depends</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Balance Verification</td>
                    <td className="p-2 border-b text-primary">✓ Automatic</td>
                    <td className="p-2 border-b">Rare</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 id="how-to-convert">How to Convert Your UK Bank Statement</h2>
            <ol>
              <li><strong>Upload your PDF:</strong> Drag and drop your statement from Barclays, HSBC, Lloyds, NatWest, or any UK bank</li>
              <li><strong>Automatic Detection:</strong> ClearlyLedger identifies the bank format and applies appropriate parsing rules</li>
              <li><strong>Review Extracted Data:</strong> Preview the transactions, dates, amounts, and references before export</li>
              <li><strong>Export to Excel:</strong> Download your structured data in .xlsx or .csv format</li>
            </ol>

            <h2 id="common-use-cases">Common Use Cases in the UK</h2>
            <ul>
              <li><strong>VAT Returns:</strong> Extract transaction data for quarterly VAT submissions</li>
              <li><strong>HMRC Submissions:</strong> Prepare financial records for Self Assessment or Corporation Tax</li>
              <li><strong>Mortgage Applications:</strong> Organise bank statements for mortgage lenders</li>
              <li><strong>Business Accounting:</strong> Import transactions into Sage, Xero, or QuickBooks</li>
              <li><strong>Expense Claims:</strong> Track business expenses for reimbursement</li>
              <li><strong>Audit Preparation:</strong> Create clean financial records for auditors</li>
            </ul>

            <h2 id="key-takeaways">Key Takeaways</h2>
            <ul>
              <li><strong>Major UK banks supported:</strong> Barclays, HSBC, Lloyds, NatWest, Santander, and Nationwide</li>
              <li><strong>UK GDPR compliant:</strong> Local browser processing with no server uploads</li>
              <li><strong>Sort codes preserved:</strong> XX-XX-XX format maintained in exports</li>
              <li><strong>GBP formatting:</strong> Proper Pound Sterling handling throughout</li>
              <li><strong>Balance verification:</strong> Automatic accuracy checks before export</li>
            </ul>
            <p>
              Ready to convert your UK bank statements? <Link to="/" className="text-primary hover:underline">Start your free conversion</Link>.
            </p>
          </div>

          <AuthorSection />

          {/* CTA Section */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Ready to Convert Your UK Bank Statement?
            </h2>
            <p className="text-muted-foreground mb-6">
              Upload your Barclays, HSBC, Lloyds, NatWest, or Santander statement and get structured Excel output in seconds.
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
              <Link to="/blog/south-africa-bank-statement-converter" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Convert South African Bank Statement PDFs to Excel</h4>
                <p className="text-sm text-muted-foreground">Guide for ABSA, Standard Bank, FNB, and Nedbank statements.</p>
              </Link>
              <Link to="/blog/privacy-secure-bank-statement-conversion" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Bank Statement Conversion: Ensuring Privacy & Secure Processing</h4>
                <p className="text-sm text-muted-foreground">Learn about privacy-first conversion practices for sensitive financial data.</p>
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

export default BlogPostUK;
