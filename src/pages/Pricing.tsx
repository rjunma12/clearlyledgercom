import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import { Helmet } from "react-helmet-async";

const pricingFaqs = [
  {
    question: "What's the difference between free and Pro plans?",
    answer: "Free registered accounts get 5 pages per day with standard features. Pro subscribers ($19/month) get unlimited pages, priority processing, optional PII masking, and email support."
  },
  {
    question: "Is there a money-back guarantee?",
    answer: "Yes! All paid plans include a 14-day money-back guarantee in compliance with EU consumer protection standards. For Pro subscriptions, we extend this to a 30-day satisfaction guarantee. Lifetime purchases are covered by the 14-day policy from date of purchase."
  },
  {
    question: "What does Lifetime access include?",
    answer: "Lifetime membership ($119 one-time payment) includes everything in Pro—unlimited pages, PII masking, priority support—plus all future features forever. No recurring fees."
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer: "Absolutely. You can cancel your Pro subscription at any time from your dashboard. You'll retain access until the end of your billing period."
  },
  {
    question: "Do you offer team or enterprise pricing?",
    answer: "Yes! For teams of 5+ users or enterprise needs, contact us for custom pricing with volume discounts, dedicated support, and SLA guarantees."
  },
  {
    question: "How does the page limit work?",
    answer: "Each page of a PDF counts as one page. Multi-page statements consume multiple pages from your daily limit. Limits reset every 24 hours at midnight UTC."
  }
];

const Pricing = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pricing - ClearlyLedger",
    "description": "Choose your plan for converting bank statements to Excel. Free tier available, Pro plan for unlimited pages, and Lifetime access with one-time payment.",
    "url": "https://clearlyledger.com/pricing",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://clearlyledger.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Pricing",
          "item": "https://clearlyledger.com/pricing"
        }
      ]
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ClearlyLedger Bank Statement Converter",
    "description": "Convert PDF bank statements to Excel with balance verification and multi-region support.",
    "brand": {
      "@type": "Brand",
      "name": "ClearlyLedger"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2026-12-31",
        "description": "5 pages per day for registered users"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "19",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2026-12-31",
        "billingIncrement": "P1M",
        "description": "Unlimited pages, PII masking, priority support"
      },
      {
        "@type": "Offer",
        "name": "Lifetime Plan",
        "price": "119",
        "priceCurrency": "USD",
        "availability": "https://schema.org/LimitedAvailability",
        "priceValidUntil": "2026-12-31",
        "description": "One-time payment, unlimited forever, all future features"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - ClearlyLedger | Bank Statement to Excel Converter</title>
        <meta name="description" content="Choose your plan for converting bank statements to Excel. Free tier available, Pro plan for unlimited pages, and Lifetime access with one-time payment." />
        <meta name="keywords" content="bank statement converter pricing, PDF to Excel price, ClearlyLedger plans, lifetime deal" />
        <link rel="canonical" href="https://clearlyledger.com/pricing" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/pricing" />
        <meta property="og:title" content="Pricing - ClearlyLedger | Bank Statement Converter" />
        <meta property="og:description" content="Choose your plan for converting bank statements to Excel. Free tier available, Pro plan for unlimited pages." />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - ClearlyLedger" />
        <meta name="twitter:description" content="Choose your plan for converting bank statements to Excel." />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>
      
      <Navbar />
      <main className="pt-16">
        <PricingSection />
        <FAQSection 
          faqs={pricingFaqs}
          title="Pricing FAQ"
          description="Common questions about plans, billing, and features."
          showSchema={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
