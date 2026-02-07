import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Upload, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import TableOfContents from "@/components/blog/TableOfContents";
import AuthorSection from "@/components/blog/AuthorSection";
import ShareButtons from "@/components/blog/ShareButtons";
import ReadingProgress from "@/components/blog/ReadingProgress";

const BlogPost1 = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Convert Bank Statement PDFs to Excel (Step-by-Step Guide)",
    "description": "Learn how to convert PDF bank statements to Excel in minutes. Step-by-step workflow, common issues, and troubleshooting tips.",
    "author": { "@type": "Organization", "name": "ClearlyLedger" },
    "publisher": { "@type": "Organization", "name": "ClearlyLedger" },
    "datePublished": "2025-01-15",
    "dateModified": "2025-01-15",
    "about": {
      "@type": "Thing",
      "name": "Bank Statement Conversion",
      "description": "The process of extracting transaction data from PDF bank statements into spreadsheet format"
    },
    "mentions": [
      { "@type": "SoftwareApplication", "name": "QuickBooks" },
      { "@type": "SoftwareApplication", "name": "Xero" },
      { "@type": "SoftwareApplication", "name": "Sage" },
      { "@type": "SoftwareApplication", "name": "Microsoft Excel" }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clearlyledger.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://clearlyledger.com/blog" },
      { "@type": "ListItem", "position": 3, "name": "Convert Bank Statements to Excel" }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Convert Bank Statement PDF to Excel Using ClearlyLedger",
    "description": "Step-by-step guide to converting PDF bank statements to Excel spreadsheets.",
    "totalTime": "PT2M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload your PDF",
        "text": "Drag and drop or click to select your bank statement (max 10 MB)"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Wait for processing",
        "text": "Our system automatically extracts transaction data from your PDF"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Review the preview",
        "text": "Check that dates, descriptions, and amounts look correct"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Download Excel file",
        "text": "Get a clean, structured spreadsheet ready for use"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Helmet>
        <title>How to Convert Bank Statement PDFs to Excel (Step-by-Step Guide) | ClearlyLedger</title>
        <meta name="description" content="Learn how to convert PDF bank statements to Excel in minutes. Step-by-step workflow, common issues, and troubleshooting tips to make financial data usable." />
        <meta name="keywords" content="bank statement to Excel, PDF to Excel converter, convert bank statement online, financial data automation" />
        <link rel="canonical" href="https://clearlyledger.com/blog/convert-bank-statements-to-excel" />
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      </Helmet>
      
      <Navbar />
      
      <article className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Convert Bank Statements</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
              Tutorial
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
              How to Convert Bank Statement PDFs to Excel (Step-by-Step Guide)
            </h1>
            {/* Clean SEO-optimized metadata line - no icons */}
            <p className="text-sm text-muted-foreground mb-4">
              By ClearlyLedger Team · January 15, 2025 · 6 min read
            </p>
            <ShareButtons 
              url="https://clearlyledger.com/blog/convert-bank-statements-to-excel" 
              title="How to Convert Bank Statement PDFs to Excel (Step-by-Step Guide)"
            />
          </header>

          {/* Table of Contents */}
          <TableOfContents />

          {/* TL;DR Box */}
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground mb-1">TL;DR</p>
                <p className="text-sm text-muted-foreground">
                  To convert a bank statement PDF to Excel: upload your PDF to ClearlyLedger, wait for automatic processing, review the extracted transactions, then download your clean Excel file. The process takes under 60 seconds and includes balance verification to ensure accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="lead text-lg text-muted-foreground">
              Converting PDF bank statements to Excel is a common need for accountants, small business owners, and anyone managing their finances. This guide walks you through the process step-by-step.
            </p>

            <h2>Why Convert PDF Bank Statements to Excel?</h2>
            <p>
              Bank statements in PDF format are designed for reading, not analysis. Converting them to Excel unlocks powerful capabilities:
            </p>
            <ul>
              <li><strong>Data analysis:</strong> Filter, sort, and calculate totals easily</li>
              <li><strong>Budget tracking:</strong> Categorize transactions and track spending</li>
              <li><strong>Accounting integration:</strong> Import into QuickBooks, Xero, or other software</li>
              <li><strong>Auditing:</strong> Cross-reference transactions with receipts and invoices</li>
            </ul>

            <h2>Common Challenges With Manual Conversion</h2>
            <p>
              Manually copying data from PDFs is time-consuming and error-prone:
            </p>
            <ul>
              <li>Copy-paste often breaks formatting</li>
              <li>Multi-page statements are tedious to process</li>
              <li>Number formatting (dates, currencies) gets corrupted</li>
              <li>Risk of transposition errors in financial data</li>
            </ul>

            <h2>Step-by-Step Guide Using ClearlyLedger</h2>
            <p>
              Our <Link to="/features" className="text-primary hover:underline">bank statement converter</Link> simplifies the process:
            </p>
            <ol>
              <li><strong>Upload your PDF:</strong> Drag and drop or click to select your bank statement (max 10 MB)</li>
              <li><strong>Wait for processing:</strong> Our system automatically extracts transaction data</li>
              <li><strong>Review the preview:</strong> Check that dates, descriptions, and amounts look correct</li>
              <li><strong>Download Excel file:</strong> Get a clean, structured spreadsheet ready for use</li>
            </ol>

            <h2>Tips for Multi-Page or Scanned PDFs</h2>
            <p>
              Some bank statements present unique challenges:
            </p>
            <ul>
              <li><strong>Multi-page statements:</strong> Our tool handles multiple pages automatically, stitching transactions together</li>
              <li><strong>Scanned documents:</strong> For best results, use digitally-generated PDFs rather than scanned images</li>
              <li><strong>Password-protected PDFs:</strong> Remove password protection before uploading</li>
            </ul>

            <h2>How to Check Accuracy (Opening/Closing Balances)</h2>
            <p>
              One key feature of ClearlyLedger is automatic <strong>balance verification</strong>. The tool checks that:
            </p>
            <ul>
              <li>Opening balance + transactions = Closing balance</li>
              <li>No transactions are missing or duplicated</li>
              <li>Amounts are parsed correctly</li>
            </ul>
            <p>
              This gives you confidence that the converted data is accurate and complete.
            </p>

            <h2>FAQ & Troubleshooting</h2>
            
            <h3>Q: What file formats are supported?</h3>
            <p>We support PDF, Excel (.xlsx), and CSV files up to 10 MB.</p>

            <h3>Q: How many pages can I convert for free?</h3>
            <p>
              Anonymous users get 1 page per 24 hours. <Link to="/pricing" className="text-primary hover:underline">Registered accounts</Link> get 5 pages daily, while paid plans offer unlimited conversions.
            </p>

            <h3>Q: Is my data secure?</h3>
            <p>
              Yes. Files are processed securely and deleted automatically after conversion. We never store, share, or train on your documents.
            </p>

            <h3>Q: What if my statement doesn't convert correctly?</h3>
            <p>
              <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link> with details about the issue. We're continuously improving format coverage.
            </p>
          </div>

          {/* Author Section */}
          <AuthorSection />

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-muted/50 rounded-xl text-center">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Ready to convert your bank statements?
            </h3>
            <p className="text-muted-foreground mb-6">
              Try our converter now—no signup required for your first page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button variant="hero" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="glass">View Pricing</Button>
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/blog/indian-bank-statement-converter" className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Indian Bank Statement Converter</h4>
                <p className="text-sm text-muted-foreground">Tools and tips for Indian bank formats</p>
              </Link>
              <Link to="/blog/accurate-bank-statement-conversion-workflows" className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground mb-1">Improve Financial Workflows</h4>
                <p className="text-sm text-muted-foreground">Accuracy and automation tips</p>
              </Link>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="mt-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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

export default BlogPost1;
