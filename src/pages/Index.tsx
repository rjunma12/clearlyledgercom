import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DemoSkeleton from "@/components/DemoSkeleton";

// Lazy load below-the-fold sections to shrink the initial JS bundle,
// reduce the longest main-thread task, and improve Speed Index / LCP.
const PricingSection = lazy(() => import("@/components/PricingSection"));
const Footer = lazy(() => import("@/components/Footer"));
const RegionStrip = lazy(() => import("@/components/RegionStrip"));
const AdvantagesSection = lazy(() => import("@/components/AdvantagesSection"));
const AccuracySection = lazy(() => import("@/components/AccuracySection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection"));
const InteractiveDemo = lazy(() => import("@/components/InteractiveDemo"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));

// Lightweight skeleton placeholder that preserves vertical rhythm
const SectionFallback = ({ className = "py-16" }: { className?: string }) => (
  <div className={`${className} animate-pulse bg-surface-elevated/30`} aria-hidden="true" />
);

const homepageFaqs = [
  {
    question: "How do I convert a bank statement PDF to Excel?",
    answer: "Simply upload your PDF bank statement to ClearlyLedger. Our system automatically detects the bank format, extracts all transactions, verifies the balance, and generates a clean Excel file ready for download in under 60 seconds."
  },
  {
    question: "Is ClearlyLedger safe for sensitive financial data?",
    answer: "Yes. We use HTTPS encryption for all uploads, process files in memory without persistent storage, and automatically delete all data after conversion. Your statements are used only to produce your output — they are never shared or resold."
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
    question: "Which banks do you support?",
    answer: "All of them. ClearlyLedger works with any bank in any country in any language — powered by AI. There is no supported bank list. If it's a bank statement PDF, we can convert it."
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
        <Suspense fallback={<SectionFallback className="py-8" />}>
          <RegionStrip />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-20" />}>
          <AdvantagesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-24" />}>
          <PricingSection variant="simplified" />
        </Suspense>
        <Suspense fallback={<DemoSkeleton />}>
          <InteractiveDemo />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-20" />}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-20" />}>
          <AccuracySection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-20" />}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FAQSection
            faqs={homepageFaqs}
            title="Frequently Asked Questions"
            description="Quick answers to common questions about bank statement conversion."
          />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-24" />}>
          <SecuritySection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="py-24" />}>
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
