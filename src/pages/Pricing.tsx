import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import { Helmet } from "react-helmet-async";

const pricingFaqs = [
  {
    question: "Can I try ClearlyLedger without signing up?",
    answer:
      "Yes. You can convert 1 page every 24 hours without an account. Create a free account to get 6 pages every 24 hours plus saved conversion history."
  },
  {
    question: "Are taxes included in the price?",
    answer:
      "Yes. All listed prices are inclusive of applicable taxes. Paddle, our Merchant of Record, calculates and remits VAT, GST, and sales tax in 200+ countries automatically — there are no surprise charges at checkout."
  },
  {
    question: "What countries can pay for a paid plan?",
    answer:
      "Paid plans are available worldwide. Payments are processed by Paddle in 25+ currencies and 30+ payment methods. Prices are shown in USD and Paddle automatically applies your local currency at checkout."
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refunds are handled by Paddle on a case-by-case basis. If something is not working as expected, email helppropsal@outlook.com within 14 days of purchase and we will work with Paddle to resolve it."
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your account dashboard at any time. You keep access until the end of your current billing period."
  },
  {
    question: "How does the page limit work?",
    answer:
      "Each page of your PDF counts as one page. A 12-page bank statement uses 12 pages. Free anonymous and free account limits reset every 24 hours. Paid plan limits reset every calendar month."
  },
  {
    question: "Which banks are supported?",
    answer:
      "Any bank worldwide. Known banks are processed instantly using our rule-based engine. Banks we have not seen before use our AI-powered parser, and the system learns the layout for next time."
  }
];

const Pricing = () => {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pricing - ClearlyLedger",
    description:
      "Simple global pricing for ClearlyLedger. Free anonymous and free account tiers, plus Starter, Professional, and Business plans. All prices inclusive of applicable taxes.",
    url: "https://clearlyledger.com/pricing",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://clearlyledger.com/" },
        { "@type": "ListItem", position: 2, name: "Pricing", item: "https://clearlyledger.com/pricing" }
      ]
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ClearlyLedger Bank Statement Converter",
    description:
      "Convert PDF bank statements from any bank worldwide into clean Excel or CSV files. Used by accountants and bookkeepers in 30+ countries.",
    brand: { "@type": "Brand", name: "ClearlyLedger" },
    offers: [
      {
        "@type": "Offer",
        name: "Anonymous Free",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "1 page every 24 hours, no signup required."
      },
      {
        "@type": "Offer",
        name: "Free Account",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "6 pages every 24 hours, signup required."
      },
      {
        "@type": "Offer",
        name: "Starter (Monthly)",
        price: "15",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        billingIncrement: "P1M",
        description: "400 pages per month, CSV + Excel export. Tax inclusive."
      },
      {
        "@type": "Offer",
        name: "Starter (Annual)",
        price: "90",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        billingIncrement: "P1Y",
        description: "400 pages per month, billed annually. Save 50%. Tax inclusive."
      },
      {
        "@type": "Offer",
        name: "Professional (Monthly)",
        price: "30",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        billingIncrement: "P1M",
        description: "1,500 pages per month, batch upload, categorization. Tax inclusive."
      },
      {
        "@type": "Offer",
        name: "Professional (Annual)",
        price: "180",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        billingIncrement: "P1Y",
        description: "1,500 pages per month, billed annually. Save 50%. Tax inclusive."
      },
      {
        "@type": "Offer",
        name: "Business (Monthly)",
        price: "50",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        billingIncrement: "P1M",
        description: "4,000 pages per month, priority support and onboarding. Tax inclusive."
      },
      {
        "@type": "Offer",
        name: "Business (Annual)",
        price: "300",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        billingIncrement: "P1Y",
        description: "4,000 pages per month, billed annually. Save 50%. Tax inclusive."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - ClearlyLedger | Bank Statement to Excel Converter</title>
        <meta
          name="description"
          content="Free to try with no signup. Starter $15/mo, Professional $30/mo, Business $50/mo. All prices inclusive of applicable taxes. Works with banks worldwide."
        />
        <meta
          name="keywords"
          content="bank statement converter pricing, PDF to Excel price, ClearlyLedger plans, global bank statement converter"
        />
        <link rel="canonical" href="https://clearlyledger.com/pricing" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clearlyledger.com/pricing" />
        <meta property="og:title" content="Pricing - ClearlyLedger | Bank Statement Converter" />
        <meta
          property="og:description"
          content="Free to try with no signup. Paid plans from $15/mo. All prices inclusive of applicable taxes."
        />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - ClearlyLedger" />
        <meta
          name="twitter:description"
          content="Simple global pricing for the bank statement converter accountants worldwide rely on. Tax inclusive."
        />

        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <Navbar />
      <main className="pt-16">
        <PricingSection />
        <FAQSection
          faqs={pricingFaqs}
          title="Pricing FAQ"
          description="Common questions about plans, billing, and global payments."
          showSchema={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
