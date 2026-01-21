import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Helmet } from "react-helmet-async";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - ClearlyLedger | Bank Statement to Excel Converter</title>
        <meta name="description" content="Choose your plan for converting bank statements to Excel. Free tier available, Pro plan for unlimited pages, and Lifetime access with one-time payment." />
        <link rel="canonical" href="https://clearlyledger.com/pricing" />
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
