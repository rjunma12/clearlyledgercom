import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import InteractiveDemo from "@/components/InteractiveDemo";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import SecuritySection from "@/components/SecuritySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

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
        "operatingSystem": "Web",
        "description": "Convert PDF bank statements to Excel in seconds. Secure, accurate, and supports 50+ countries.",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "119",
          "priceCurrency": "USD",
          "offerCount": "4"
        },
        "featureList": [
          "Bank statement to Excel conversion",
          "Multi-region support",
          "Balance verification",
          "Privacy-first processing",
          "Optional PII masking"
        ]
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
        <PricingSection />
        <InteractiveDemo />
        <FeaturesSection />
        <HowItWorksSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;