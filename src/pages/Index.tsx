import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import DemoSkeleton from "@/components/DemoSkeleton";

// Lazy load heavy components that are below the fold
const InteractiveDemo = lazy(() => import("@/components/InteractiveDemo"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));

const homepageFaqs = [
  {
    question: "How do I convert a bank statement PDF to Excel?",
    answer: "Simply upload your PDF bank statement to ClearlyLedger. Our system automatically detects the bank format, extracts all transactions, verifies the balance, and generates a clean Excel file ready for download in under 60 seconds."
  },
  {
    question: "Is ClearlyLedger safe for sensitive financial data?",
    answer: "Yes. We use HTTPS encryption for all uploads, process files in memory without persistent storage, and automatically delete all data after conversion. We never store, share, or use your documents for AI training."
  },
  {
    question: "What file formats does ClearlyLedger support?",
    answer: "We support PDF bank statements (the most common format), as well as Excel (.xlsx) and CSV files. Maximum file size is 10 MB. We handle multi-page statements automatically."
  },
  {
    question: "How many pages can I convert for free?",
    answer: "Anonymous users can convert 1 page per 24 hours. Free registered accounts get 5 pages daily. Paid plans (Starter, Professional, Business) offer higher page limits. All paid plans include a 14-day money-back guarantee."
  },
  {
    question: "Does ClearlyLedger work with Indian and international bank statements?",
    answer: "Yes! We support 50+ countries and 200+ banks including major Indian banks (SBI, HDFC, ICICI, Axis), US banks, UK banks, European banks, and many more. Our multi-region engine handles local date formats and currency conventions."
  },
  {
    question: "What is PII masking in bank statement conversion?",
    answer: "PII (Personally Identifiable Information) masking replaces sensitive data like account numbers and names with anonymized placeholders. This is useful when sharing statements with third parties while protecting privacy. Available on all paid plans."
  },
  {
    question: "How does balance verification work?",
    answer: "Our system extracts the opening balance, all transactions, and closing balance from your statement. It then mathematically verifies that opening balance plus all transactions equals the closing balance, catching any parsing errors or missing data."
  },
  {
    question: "Can I use ClearlyLedger without signing up?",
    answer: "Yes! You can convert 1 page per day without creating an account. For more pages or advanced features like PII masking, you can create a free account or subscribe to a paid plan."
  }
];

const Index = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://clearlyledger.com/#organization",
        "name": "ClearlyLedger",
        "url": "https://clearlyledger.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://clearlyledger.com/logo.png"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "helppropsal@outlook.com",
          "contactType": "customer support"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://clearlyledger.com/#website",
        "url": "https://clearlyledger.com",
        "name": "ClearlyLedger",
        "publisher": {
          "@id": "https://clearlyledger.com/#organization"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://clearlyledger.com/#software",
        "name": "ClearlyLedger",
        "applicationCategory": "FinanceApplication",
        "applicationSubCategory": "Financial Data Conversion",
        "operatingSystem": "Web",
        "description": "Convert PDF bank statements to Excel in seconds. Secure, accurate, and supports 50+ countries.",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "50",
          "priceCurrency": "USD",
          "offerCount": "3"
        },
        "featureList": [
          "Bank statement to Excel conversion",
          "Multi-region support for 50+ countries",
          "Balance verification",
          "Privacy-first processing",
          "Optional PII masking",
          "QuickBooks and Xero compatible export"
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://clearlyledger.com/#webpage",
        "url": "https://clearlyledger.com",
        "name": "ClearlyLedger - Convert Bank Statements to Excel | Fast & Secure",
        "isPartOf": {
          "@id": "https://clearlyledger.com/#website"
        },
        "about": {
          "@id": "https://clearlyledger.com/#software"
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-title", ".hero-description"]
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>ClearlyLedger - Convert Bank Statements to Excel | Fast & Secure</title>
        <meta name="description" content="Convert PDF bank statements to Excel in seconds. Secure, accurate, and supports 50+ countries. No signup required for your first page." />
        <meta name="keywords" content="bank statement to Excel, PDF to Excel converter, convert bank statement online, financial data automation, bank statement converter" />
        <link rel="canonical" href="https://clearlyledger.com/" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/" />
        <meta property="og:title" content="ClearlyLedger - Convert Bank Statements to Excel" />
        <meta property="og:description" content="Convert PDF bank statements to Excel in seconds. Secure, accurate, and supports 50+ countries." />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ClearlyLedger - Convert Bank Statements to Excel" />
        <meta name="twitter:description" content="Convert PDF bank statements to Excel in seconds. Secure, accurate, and supports 50+ countries." />
        <meta name="twitter:image" content="https://clearlyledger.com/og-image.png" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
      </Helmet>
      
      <Navbar />
      <main>
        <HeroSection />
        <AdvantagesSection />
        <PricingSection variant="simplified" />
        <Suspense fallback={<DemoSkeleton />}>
          <InteractiveDemo />
        </Suspense>
        <FeaturesSection />
        <HowItWorksSection />
        <Suspense fallback={<div className="py-16 animate-pulse bg-surface-elevated/30" />}>
          <FAQSection 
            faqs={homepageFaqs}
            title="Frequently Asked Questions"
            description="Quick answers to common questions about bank statement conversion."
          />
        </Suspense>
        <Suspense fallback={<div className="py-24 animate-pulse bg-surface-elevated/50" />}>
          <SecuritySection />
        </Suspense>
        <Suspense fallback={<div className="py-24 animate-pulse" />}>
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
