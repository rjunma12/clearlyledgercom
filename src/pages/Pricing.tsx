import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import { Helmet } from "react-helmet-async";

const pricingFaqs = [
  {
    question: "Is the Free plan really free?",
    answer:
      "Yes. The Free plan gives you 5 pages per month with CSV export and works with banks from any country. No credit card is required to sign up."
  },
  {
    question: "What countries can pay for Pro?",
    answer:
      "Pro is available worldwide. Payments are processed by Paddle, our Merchant of Record, in 25+ currencies and 30+ payment methods. You see prices in USD on our site, and Paddle automatically converts and applies the correct local currency, VAT, GST, or sales tax at checkout."
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refunds are handled by Paddle on a case-by-case basis. If something is not working as expected, email helppropsal@outlook.com within 14 days of purchase and we will work with Paddle to resolve it."
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer:
      "Yes. Cancel from your account dashboard at any time. You keep Pro access until the end of your current billing period."
  },
  {
    question: "How does the page limit work?",
    answer:
      "Each page of your PDF counts as one page. A 12-page bank statement uses 12 pages. The Free plan resets every calendar month. Pro is unlimited."
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
      "Simple global pricing for ClearlyLedger. Free plan with 5 pages per month, Pro plan at $36/month or $359/year. Works with banks worldwide.",
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
        name: "Free Plan",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2026-12-31",
        description: "5 pages per month, CSV export, works with any bank."
      },
      {
        "@type": "Offer",
        name: "Pro Plan (Monthly)",
        price: "36",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2026-12-31",
        billingIncrement: "P1M",
        description:
          "Unlimited pages, Excel + CSV export, batch upload up to 50 files, priority support."
      },
      {
        "@type": "Offer",
        name: "Pro Plan (Annual)",
        price: "359",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2026-12-31",
        billingIncrement: "P1Y",
        description:
          "Unlimited pages, Excel + CSV export, batch upload up to 50 files, priority support. Save 17% vs monthly."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - ClearlyLedger | Bank Statement to Excel Converter</title>
        <meta
          name="description"
          content="Free plan with 5 pages per month. Pro plan at $36/month or $359/year. Works with banks worldwide. Local currency and taxes calculated at checkout by Paddle."
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
          content="Free plan with 5 pages per month. Pro plan at $36/mo or $359/yr. Works with banks worldwide."
        />
        <meta property="og:image" content="https://clearlyledger.com/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - ClearlyLedger" />
        <meta
          name="twitter:description"
          content="Simple global pricing for the bank statement converter accountants worldwide rely on."
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
