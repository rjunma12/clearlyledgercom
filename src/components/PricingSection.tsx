import { Button } from "@/components/ui/button";
import { Check, Sparkles, Clock } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$15",
    period: "/month",
    pages: "400 pages/month",
    description: "Perfect for individual accountants and small practices.",
    features: [
      "400 pages per month",
      "All bank formats",
      "Excel & CSV export",
      "Balance verification",
      "Email support",
    ],
    cta: "Get Started",
    variant: "glass" as const,
    popular: false,
  },
  {
    name: "Professional",
    price: "$30",
    period: "/month",
    pages: "1,000 pages/month",
    description: "For growing practices with higher volume needs.",
    features: [
      "1,000 pages per month",
      "All Starter features",
      "Priority processing",
      "QuickBooks-ready format",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Business",
    price: "$50",
    period: "/month",
    pages: "4,000 pages/month",
    description: "For agencies and high-volume service firms.",
    features: [
      "4,000 pages per month",
      "All Professional features",
      "Batch upload (50 files)",
      "Custom output templates",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    variant: "glass" as const,
    popular: false,
  },
];

const PricingSection = () => {
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
            Simple, Predictable Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No AI costs. Just straightforward usage-based plans.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative glass-card p-6 sm:p-8 flex flex-col
                ${plan.popular ? 'glow-primary border-primary/30' : ''}
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] text-xs font-semibold text-primary-foreground">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Pages Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-foreground mb-6 w-fit">
                <Clock className="w-4 h-4 text-primary" />
                {plan.pages}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant={plan.variant} className="w-full">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Lifetime Plan */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="glass-card p-6 sm:p-8 gradient-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Lifetime Plan
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-semibold">
                    Limited to 350 users
                  </span>
                </div>
                <p className="text-muted-foreground mb-3">
                  One-time payment of <span className="text-foreground font-semibold">₹9,999</span> for 500 pages/month forever.
                </p>
                <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-primary" />
                    500 pages/month (resets monthly)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-primary" />
                    Email support (24-72hrs)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-primary" />
                    All standard features
                  </li>
                </ul>
              </div>
              <Button variant="glass" size="lg" className="flex-shrink-0">
                Claim Your Spot
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
