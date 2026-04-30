import { useState } from "react";
import { Check, FileText, Globe, Shield, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/hooks/use-checkout";

type BillingInterval = "monthly" | "annual";

const PRO_MONTHLY_PRICE = 36;
const PRO_ANNUAL_PRICE = 359;
const PRO_ANNUAL_MONTHLY_EQUIVALENT = 30;
const ANNUAL_SAVINGS_PERCENT = 17;

interface PricingSectionProps {
  variant?: "full" | "simplified";
}

const PricingSection = ({ variant = "full" }: PricingSectionProps) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const { initiateCheckout, isLoading, loadingPlan } = useCheckout();

  const isAnnual = billingInterval === "annual";
  const proPlanKey = isAnnual ? "pro_annual" : "pro";
  const proPrice = isAnnual ? PRO_ANNUAL_PRICE : PRO_MONTHLY_PRICE;
  const proPeriod = isAnnual ? "/year" : "/month";

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
            Start free. Upgrade to Pro for unlimited conversions. All prices in USD.
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
                Save {ANNUAL_SAVINGS_PERCENT}%
              </span>
            </span>
          </div>
        )}

        {/* Two-tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="glass-card p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display text-xl font-bold text-foreground">Free</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              For trying out ClearlyLedger
            </p>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">No credit card required</p>

            <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>5 pages per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>CSV export</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Works with any bank (AI-powered for unknown banks)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Single file upload</span>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Excel export</span>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Batch upload</span>
              </li>
            </ul>

            <Link to="/signup" className="mt-auto">
              <Button variant="outline" className="w-full">
                Try it free
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 border-2 border-primary/50 glow-primary relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] text-xs font-semibold text-primary-foreground">
                <Sparkles className="w-3 h-3" />
                Most popular
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-2">
              <h3 className="font-display text-xl font-bold text-foreground">Pro</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              For accountants, bookkeepers, and finance teams
            </p>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-4xl font-bold text-foreground">${proPrice}</span>
              <span className="text-muted-foreground">{proPeriod}</span>
            </div>
            {isAnnual ? (
              <p className="text-xs text-primary mb-6">
                ${PRO_ANNUAL_MONTHLY_EQUIVALENT}/mo effective · Save {ANNUAL_SAVINGS_PERCENT}%
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-6">Cancel anytime</p>
            )}

            <ul className="space-y-3 mb-6 text-sm text-muted-foreground flex-1">
              <li className="flex items-start gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Unlimited pages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>All banks worldwide — known profiles and AI-powered fallback</span>
              </li>
              <li className="flex items-start gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Excel + CSV export</span>
              </li>
              <li className="flex items-start gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Batch upload up to 50 files at once</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Basic transaction categorization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Priority email support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Cancel anytime</span>
              </li>
            </ul>

            <p className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Supports banks from the US, UK, India, Australia, Canada, UAE, Singapore, Europe,
                and 100+ countries worldwide.
              </span>
            </p>

            <Button
              variant="hero"
              className="w-full mt-auto"
              onClick={() => initiateCheckout(proPlanKey)}
              disabled={isLoading && loadingPlan === proPlanKey}
            >
              {isLoading && loadingPlan === proPlanKey ? "Starting checkout…" : "Upgrade to Pro"}
            </Button>
          </div>
        </div>

        {/* Pricing footnote */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Prices in USD. Local currency and taxes calculated at checkout.
        </p>

        {/* Feature comparison table - full variant only */}
        {variant === "full" && (
          <div className="max-w-4xl mx-auto mt-16">
            <h3 className="font-display text-2xl font-bold text-foreground text-center mb-6">
              Compare features
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Feature</th>
                    <th className="text-center p-4 font-medium text-foreground">Free</th>
                    <th className="text-center p-4 font-medium text-foreground">Pro</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <ComparisonRow label="Pages per month" free="5" pro="Unlimited" />
                  <ComparisonRow label="CSV export" free={true} pro={true} />
                  <ComparisonRow label="Excel export" free={false} pro={true} />
                  <ComparisonRow label="Worldwide bank support" free={true} pro={true} />
                  <ComparisonRow label="AI fallback for unknown banks" free={true} pro={true} />
                  <ComparisonRow label="Balance verification" free={true} pro={true} />
                  <ComparisonRow label="Single file upload" free={true} pro={true} />
                  <ComparisonRow label="Batch upload (up to 50 files)" free={false} pro={true} />
                  <ComparisonRow label="Transaction categorization" free={false} pro={true} />
                  <ComparisonRow label="Priority email support" free={false} pro={true} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trust footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <Shield className="w-4 h-4 text-primary" />
            <span>Global payments by Paddle · Cancel anytime · No hidden fees</span>
          </p>
        </div>
      </div>
    </section>
  );
};

interface ComparisonRowProps {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

const ComparisonRow = ({ label, free, pro }: ComparisonRowProps) => (
  <tr className="border-t border-border">
    <td className="p-4 text-foreground">{label}</td>
    <td className="p-4 text-center">
      <ComparisonCell value={free} />
    </td>
    <td className="p-4 text-center">
      <ComparisonCell value={pro} />
    </td>
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
