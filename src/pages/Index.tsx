import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InteractiveDemo from "@/components/InteractiveDemo";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import SecuritySection from "@/components/SecuritySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <InteractiveDemo />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
