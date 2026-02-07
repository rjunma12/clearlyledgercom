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
  "headline": "Best Tools for Converting Malaysian Bank Statement PDFs to Excel",
  "description": "Convert Maybank, CIMB, Public Bank, and RHB statements to Excel. Handles MYR formats, bilingual statements, and PDPA-compliant processing.",
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
  "mainEntityOfPage": "https://clearlyledger.com/blog/malaysia-bank-statement-converter",
  "about": [
    { "@type": "Thing", "name": "Malaysian Banking" },
    { "@type": "Thing", "name": "PDF to Excel Conversion" }
  ],
  "mentions": [
    { "@type": "Organization", "name": "Maybank" },
    { "@type": "Organization", "name": "CIMB Bank" },
    { "@type": "Organization", "name": "Public Bank" },
    { "@type": "Organization", "name": "RHB Bank" },
    { "@type": "Organization", "name": "Hong Leong Bank" }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clearlyledger.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clearlyledger.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Malaysia Bank Statement Converter", "item": "https://clearlyledger.com/blog/malaysia-bank-statement-converter" }
  ]
};

const BlogPostMalaysia = () => {
  const shareUrl = "https://clearlyledger.com/blog/malaysia-bank-statement-converter";
  const shareTitle = "Best Tools for Converting Malaysian Bank Statement PDFs to Excel";

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Helmet>
        <title>Best Tools for Converting Malaysian Bank Statement PDFs to Excel | ClearlyLedger</title>
        <meta name="description" content="Convert Maybank, CIMB, Public Bank, and RHB statements to Excel. Handles MYR formats, bilingual statements, and PDPA-compliant processing." />
        <meta name="keywords" content="Malaysia bank statement converter, Malaysian bank PDF Excel, Maybank statement conversion, CIMB Excel, Public Bank statement, RHB PDF converter" />
        <link rel="canonical" href="https://clearlyledger.com/blog/malaysia-bank-statement-converter" />
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
            <span className="text-foreground">Malaysia Bank Statement Converter</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">Regional</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Best Tools for Converting Malaysian Bank Statement PDFs to Excel
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
              Malaysian bank statements from Maybank, CIMB, Public Bank, RHB, and Hong Leong often include bilingual content (Malay/English) and MYR-specific formats. ClearlyLedger handles these automatically with PDPA-compliant local processing.
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 id="why-convert-my-statements">Why Convert Malaysian Bank Statements to Excel?</h2>
            <p>
              Malaysian businesses, accountants, and individuals frequently need to convert bank statement PDFs to Excel for GST reporting, tax submissions to LHDN, business accounting, or personal financial tracking. The diverse banking landscape in Malaysia means dealing with multiple statement formats.
            </p>
            <p>
              ClearlyLedger automatically recognizes statements from major Malaysian banks and extracts transaction data with proper MYR currency handling.
            </p>

            <h2 id="major-my-banks">Major Malaysian Banks Supported</h2>
            <p>Our converter handles statements from all major Malaysian financial institutions:</p>
            
            <h3 id="maybank">Maybank (Malayan Banking Berhad)</h3>
            <p>
              As Malaysia's largest bank, Maybank statements are commonly processed. Our converter handles Maybank's detailed transaction listings, reference numbers, and account summaries accurately.
            </p>

            <h3 id="cimb">CIMB Bank</h3>
            <p>
              CIMB statements often feature bilingual headers and detailed merchant categorizations. ClearlyLedger parses both Malay and English content seamlessly.
            </p>

            <h3 id="public-bank">Public Bank</h3>
            <p>
              Public Bank PDFs include comprehensive transaction histories with detailed timestamps. Our tool captures all fields while maintaining data accuracy.
            </p>

            <h3 id="rhb-bank">RHB Bank</h3>
            <p>
              RHB statements feature unique reference formats and transaction codes. ClearlyLedger maps these to clean Excel columns for easy analysis.
            </p>

            <h3 id="hong-leong">Hong Leong Bank</h3>
            <p>
              Hong Leong Bank statements are known for detailed categorization. Our converter preserves these categories when exporting to Excel.
            </p>

            <h3 id="ambank">AmBank</h3>
            <p>
              AmBank statements include comprehensive transaction metadata. ClearlyLedger extracts all relevant fields for complete financial records.
            </p>

            <h2 id="local-format-challenges">Malaysian Format Challenges</h2>
            <p>Converting Malaysian bank statements involves handling several region-specific formats:</p>
            <ul>
              <li><strong>MYR Currency:</strong> Proper handling of the Malaysian Ringgit symbol (RM) and number formatting</li>
              <li><strong>Bilingual Content:</strong> Malay and English text often appear together in statements</li>
              <li><strong>Date Formats:</strong> DD/MM/YYYY format used by Malaysian banks</li>
              <li><strong>Reference Codes:</strong> Unique Malaysian banking reference formats (DuitNow, IBG, etc.)</li>
              <li><strong>Transaction Types:</strong> Local payment methods like FPX, JomPAY, and DuitNow</li>
            </ul>

            <h2 id="pdpa-compliance">PDPA Malaysia Compliance & Privacy</h2>
            <p>
              The Personal Data Protection Act (PDPA) 2010 requires careful handling of Malaysian personal financial data. ClearlyLedger addresses this by:
            </p>
            <ul>
              <li>Processing all data locally in your browser - no server uploads</li>
              <li>Optional PII masking for account numbers and personal details</li>
              <li>No data retention or storage of your bank statements</li>
              <li>Full transparency in data processing methods</li>
            </ul>

            <h2 id="comparison-table">Tool Comparison for Malaysian Bank Statements</h2>
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
                    <td className="p-2 border-b">Malaysian Bank Recognition</td>
                    <td className="p-2 border-b text-primary">✓ Automatic</td>
                    <td className="p-2 border-b">Limited</td>
                    <td className="p-2 border-b">N/A</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Bilingual Support</td>
                    <td className="p-2 border-b text-primary">✓ Malay/English</td>
                    <td className="p-2 border-b">English Only</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">MYR Format Handling</td>
                    <td className="p-2 border-b text-primary">✓ Native</td>
                    <td className="p-2 border-b">Often Errors</td>
                    <td className="p-2 border-b">Manual</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">PDPA Compliant</td>
                    <td className="p-2 border-b text-primary">✓ Local Processing</td>
                    <td className="p-2 border-b">Varies</td>
                    <td className="p-2 border-b">Depends</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 id="how-to-convert">How to Convert Your Malaysian Bank Statement</h2>
            <ol>
              <li><strong>Upload your PDF:</strong> Drag and drop your statement from Maybank, CIMB, Public Bank, RHB, or Hong Leong</li>
              <li><strong>Automatic Detection:</strong> ClearlyLedger identifies the bank format and applies appropriate parsing rules</li>
              <li><strong>Review Extracted Data:</strong> Preview the transactions, dates, and amounts before export</li>
              <li><strong>Export to Excel:</strong> Download your structured data in .xlsx or .csv format</li>
            </ol>

            <h2 id="common-use-cases">Common Use Cases in Malaysia</h2>
            <ul>
              <li><strong>GST/SST Reporting:</strong> Extract transaction data for tax compliance</li>
              <li><strong>LHDN Submissions:</strong> Prepare financial records for tax filings</li>
              <li><strong>Business Accounting:</strong> Import transactions into accounting software</li>
              <li><strong>Loan Applications:</strong> Organize financial history for bank loan applications</li>
              <li><strong>Expense Tracking:</strong> Personal finance management and budgeting</li>
            </ul>

            <h2 id="key-takeaways">Key Takeaways</h2>
            <ul>
              <li><strong>Major Malaysian banks supported:</strong> Maybank, CIMB, Public Bank, RHB, Hong Leong, and AmBank</li>
              <li><strong>Bilingual content handling:</strong> Both Malay and English text processed correctly</li>
              <li><strong>MYR format support:</strong> Malaysian Ringgit amounts handled accurately</li>
              <li><strong>DuitNow and FPX references:</strong> Local payment methods preserved</li>
              <li><strong>PDPA compliant:</strong> Local browser processing meets Malaysian privacy requirements</li>
            </ul>
            <p>
              Start converting your Malaysian bank statements. <Link to="/" className="text-primary hover:underline">Try free conversion</Link>.
            </p>
          </div>

          <AuthorSection />

          {/* CTA Section */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Ready to Convert Your Malaysian Bank Statement?
            </h2>
            <p className="text-muted-foreground mb-6">
              Upload your Maybank, CIMB, Public Bank, RHB, or Hong Leong statement and get structured Excel output in seconds.
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
              <Link to="/blog/indian-bank-statement-converter" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Best Tools for Converting Indian Bank Statement PDFs to Excel</h4>
                <p className="text-sm text-muted-foreground">Similar guide for Indian bank statements with INR format handling.</p>
              </Link>
              <Link to="/blog/japan-bank-statement-converter" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Japanese Bank Statement PDF to Excel Converter - Complete Guide</h4>
                <p className="text-sm text-muted-foreground">Guide for Japanese bank statements with Kanji and multi-language support.</p>
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

export default BlogPostMalaysia;
