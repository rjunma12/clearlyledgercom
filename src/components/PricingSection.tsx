import { useState } from "react";
import { Check, Globe, Shield, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCheckout, type PlanName } from "@/hooks/use-checkout";

type BillingInterval = "monthly" | "annual";

interface PaidTier {
  key: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPlanKey: PlanName;
  annualPlanKey: PlanName;
  popular?: boolean;
  features: string[];
}

const PAID_TIERS: PaidTier[] = [
  {
    key: "starter",
    name: "Starter",
    description: "For occasional conversions",
    monthlyPrice: 15,
    annualPrice: 90,
    monthlyPlanKey: "starter",
    annualPlanKey: "starter_annual",
    features: [
      "400 pages per month",
      "CSV + Excel export",
      "Works with any bank worldwide",
      "Single file upload",
      "Email support",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    description: "For accountants and bookkeepers",
    monthlyPrice: 30,
    annualPrice: 180,
    monthlyPlanKey: "pro",
    annualPlanKey: "pro_annual",
    popular: true,
    features: [
      "1,500 pages per month",
      "CSV + Excel export",
      "Batch upload up to 50 files",
      "Transaction categorization",
      "Priority email support",
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "For finance teams and firms",
    monthlyPrice: 50,
    annualPrice: 300,
    monthlyPlanKey: "business",
    annualPlanKey: "business_annual",
    features: [
      "4,000 pages per month",
      "CSV + Excel export",
      "Batch upload up to 50 files",
      "Transaction categorization",
      "Priority support + onboarding",
    ],
  },
];

interface PricingSectionProps {
  variant?: "full" | "simplified";
}

const PricingSection = ({ variant = "full" }: PricingSectionProps) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const { initiateCheckout, isLoading, loadingPlan } = useCheckout();

  const isAnnual = billingInterval === "annual";

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Simple pricing. Works worldwide.
          </h2>
          <p className="text-lg text-muted-foreground">
            Try it free with no signup. Create a free account for more pages, or pick a paid
            plan when you need volume. All prices in USD, inclusive of applicable taxes.
          </p>
        </div>

        {/* Monthly / annual toggle */}
        {variant === "full" && (
          <div className="flex items-center justify-center gap-3 mb-10">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={(checked) => setBillingInterval(checked ? "annual" : "monthly")}
              aria-label="Toggle annual billing"
            />
            <span
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-1.5",
                isAnnual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Annual
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Save 50%
              </span>
            </span>
          </div>
        )}

        {/* Free tiers row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
          {/* Anonymous Free */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Try it free</h3>
            <p className="text-sm text-muted-foreground mb-4">No signup required</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">$0</span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground flex-1">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>1 page every 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>CSV export</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Works with any bank worldwide</span>
              </li>
            </ul>
            <Link to="/" className="mt-auto">
              <Button variant="outline" className="w-full">
                Convert a PDF now
              </Button>
            </Link>
          </div>

          {/* Registered Free */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Free account</h3>
            <p className="text-sm text-muted-foreground mb-4">Signup required</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">$0</span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground flex-1">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>6 pages every 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>CSV + Excel export</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Conversion history saved</span>
              </li>
            </ul>
            <Link to="/signup" className="mt-auto">
              <Button variant="outline" className="w-full">
                Create free account
              </Button>
            </Link>
          </div>
        </div>

        {/* Paid tiers grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PAID_TIERS.map((tier) => {
            const planKey = isAnnual ? tier.annualPlanKey : tier.monthlyPlanKey;
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            const period = isAnnual ? "/year" : "/month";
            const monthlyEquivalent = isAnnual ? Math.round(tier.annualPrice / 12) : null;

            return (
              <div
                key={tier.key}
                className={cn(
                  "glass-card p-8 flex flex-col relative",
                  tier.popular && "border-2 border-primary/50 glow-primary"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] text-xs font-semibold text-primary-foreground">
                      <Sparkles className="w-3 h-3" />
                      Most popular
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2 mt-2">
                  <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-bold text-foreground">${price}</span>
                  <span className="text-muted-foreground">{period}</span>
                </div>
                {isAnnual ? (
                  <p className="text-xs text-primary mb-2">
                    ${monthlyEquivalent}/mo effective · Save 50%
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mb-2">Cancel anytime</p>
                )}
                <p className="text-xs text-muted-foreground mb-6">
                  All prices inclusive of applicable taxes.
                </p>

                <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                  {tier.features.map((feature, i) => {
                    const isBatch = /batch upload/i.test(feature);
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {isBatch ? (
                          <span className="font-semibold text-foreground bg-primary/10 px-1.5 py-0.5 rounded">
                            {feature}
                          </span>
                        ) : (
                          <span>{feature}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <Button
                  variant={tier.popular ? "hero" : "outline"}
                  className="w-full mt-auto"
                  onClick={() => initiateCheckout(planKey)}
                  disabled={isLoading && loadingPlan === planKey}
                >
                  {isLoading && loadingPlan === planKey
                    ? "Starting checkout…"
                    : `Get ${tier.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Pricing footnote */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Prices in USD, inclusive of applicable taxes. Paddle is our Merchant of Record and
          handles VAT, GST, and sales tax in 200+ countries.
        </p>

        {/* Feature comparison table - full variant only */}
        {variant === "full" && (
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="font-display text-2xl font-bold text-foreground text-center mb-6">
              Compare paid plans
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Feature</th>
                    <th className="text-center p-4 font-medium text-foreground">Starter</th>
                    <th className="text-center p-4 font-medium text-foreground">Professional</th>
                    <th className="text-center p-4 font-medium text-foreground">Business</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <ComparisonRow label="Pages per month" starter="400" pro="1,500" business="4,000" />
                  <ComparisonRow label="CSV export" starter={true} pro={true} business={true} />
                  <ComparisonRow label="Excel export" starter={true} pro={true} business={true} />
                  <ComparisonRow label="Worldwide bank support" starter={true} pro={true} business={true} />
                  <ComparisonRow label="Batch upload (up to 50 files)" starter={false} pro={true} business={true} />
                  <ComparisonRow label="Transaction categorization" starter={false} pro={true} business={true} />
                  <ComparisonRow label="Priority support" starter={false} pro={true} business={true} />
                  <ComparisonRow label="Onboarding assistance" starter={false} pro={false} business={true} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trust footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <Shield className="w-4 h-4 text-primary" />
            <span>Global payments by Paddle · Cancel anytime · No hidden fees</span>
          </p>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>
              Banks supported from the US, UK, India, Australia, Canada, UAE, Singapore, Europe,
              and 100+ countries worldwide.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

interface ComparisonRowProps {
  label: string;
  starter: boolean | string;
  pro: boolean | string;
  business: boolean | string;
}

const ComparisonRow = ({ label, starter, pro, business }: ComparisonRowProps) => (
  <tr className="border-t border-border">
    <td className="p-4 text-foreground">{label}</td>
    <td className="p-4 text-center"><ComparisonCell value={starter} /></td>
    <td className="p-4 text-center"><ComparisonCell value={pro} /></td>
    <td className="p-4 text-center"><ComparisonCell value={business} /></td>
  </tr>
);

const ComparisonCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") {
    return <span className="text-foreground font-medium">{value}</span>;
  }
  return value ? (
    <Check className="w-4 h-4 text-primary inline-block" aria-label="Included" />
  ) : (
    <X className="w-4 h-4 text-muted-foreground/60 inline-block" aria-label="Not included" />
  );
};

export default PricingSection;
