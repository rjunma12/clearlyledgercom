import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Helmet } from "react-helmet-async";

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
      </Helmet>
      
      <Navbar />
      <main className="pt-16">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
