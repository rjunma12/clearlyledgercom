import { useState, useEffect } from "react";
import { User, UserPlus, Zap, Users, Rocket, Shield, FileSpreadsheet } from "lucide-react";
import { PricingCard } from "./pricing/PricingCard";
import { LifetimeDealCard } from "./pricing/LifetimeDealCard";
import { useUsage } from "@/hooks/use-usage";

const PricingSection = () => {
  const { lifetimeSpotsRemaining, isAuthenticated } = useUsage();
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);

  // Scroll to plan if hash is present
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['anonymous', 'registered', 'pro', 'business', 'lifetime'].includes(hash)) {
      setHighlightedPlan(hash);
      setTimeout(() => setHighlightedPlan(null), 3000);
    }
  }, []);

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Export Comparison Table */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Export Capabilities by Plan
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Plan</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Normal Excel</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">PII Masking</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground">Anonymous</td>
                    <td className="py-2 px-3 text-center text-primary">✓</td>
                    <td className="py-2 px-3 text-center text-muted-foreground">—</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground">Registered</td>
                    <td className="py-2 px-3 text-center text-primary">✓</td>
                    <td className="py-2 px-3 text-center text-muted-foreground">—</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground">Pro</td>
                    <td className="py-2 px-3 text-center text-primary">✓</td>
                    <td className="py-2 px-3 text-center text-primary">Optional</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground font-medium">Business</td>
                    <td className="py-2 px-3 text-center text-primary">✓</td>
                    <td className="py-2 px-3 text-center text-primary font-medium">Enforced</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-foreground">Lifetime</td>
                    <td className="py-2 px-3 text-center text-primary">✓</td>
                    <td className="py-2 px-3 text-center text-primary font-medium">Enforced</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {/* Anonymous */}
          <PricingCard
            name="Anonymous"
            price="Free"
            badge="No signup required"
            badgeVariant="free"
            description="Try instantly without creating an account."
            icon={<User className="w-5 h-5 text-muted-foreground" />}
            features={[
              { text: "1 page every 24 hours" },
              { text: "Normal Excel / CSV export" },
              { text: "No history saved" },
              { text: "Basic processing" }
            ]}
            cta="Upload Instantly"
            ctaVariant="outline"
            usageIndicator="1 page/day"
          />

          {/* Registered Free */}
          <PricingCard
            name="Registered"
            price="Free"
            description="Create an account to unlock more pages and history."
            icon={<UserPlus className="w-5 h-5 text-primary" />}
            features={[
              { text: "5 pages every 24 hours", highlight: true },
              { text: "Normal Excel / CSV export" },
              { text: "Processing history" },
              { text: "Email support" }
            ]}
            cta="Create Free Account"
            ctaVariant="glass"
            usageIndicator="5 pages/day"
          />

          {/* Pro */}
          <PricingCard
            name="Pro"
            price="$19"
            period="/month"
            description="For professionals who need unlimited processing."
            icon={<Zap className="w-5 h-5 text-primary" />}
            features={[
              { text: "Unlimited pages", highlight: true },
              { text: "Normal Excel processing" },
              { text: "Optional PII masking", highlight: true },
              { text: "Full data export" },
              { text: "Faster processing" }
            ]}
            cta="Upgrade to Pro"
            ctaVariant="glass"
          />

          {/* Business - Most Popular */}
          <PricingCard
            name="Business"
            price="$49"
            period="/month"
            badge="Most Popular"
            badgeVariant="popular"
            description="For teams needing compliance-ready workflows."
            icon={<Users className="w-5 h-5 text-primary" />}
            isPopular={true}
            features={[
              { text: "Everything in Pro", highlight: true },
              { text: "Team access" },
              { text: "Enforced PII masking", highlight: true },
              { text: "Export audit logs" },
              { text: "Custom PII rules" },
              { text: "Priority processing" },
              { text: "Compliance-ready workflows", highlight: true }
            ]}
            cta="Start Business Plan"
            ctaVariant="hero"
          />
        </div>

        {/* Lifetime Deal Card */}
        <div className="max-w-4xl mx-auto">
          <LifetimeDealCard
            spotsRemaining={lifetimeSpotsRemaining}
            totalSpots={350}
          />
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            All plans include secure processing • No raw data stored after export
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
