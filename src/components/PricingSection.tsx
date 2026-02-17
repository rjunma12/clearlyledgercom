import { forwardRef, useState } from "react";
import { User, UserPlus, Zap, Shield, Check, Sparkles, Building2, FileText, Briefcase, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

type BillingInterval = 'monthly' | 'annual';

interface PlanPricing {
  monthly: number;
  annual: number;
  monthlyPages: number;
  annualPages: number;
}

const PLAN_PRICING: Record<string, PlanPricing> = {
  starter: { monthly: 15, annual: 150, monthlyPages: 400, annualPages: 4800 },
  pro: { monthly: 30, annual: 300, monthlyPages: 1000, annualPages: 12000 },
  business: { monthly: 50, annual: 500, monthlyPages: 4000, annualPages: 48000 },
};

const DODO_CHECKOUT_URLS: Record<string, string> = {
  starter: 'https://checkout.dodopayments.com/buy/pdt_0NXbRQzmQzNOnmObfjYOY?quantity=1',
  starter_annual: 'https://checkout.dodopayments.com/buy/pdt_0NXbh4iiiPhfpmhLbwg4l?quantity=1',
  pro: 'https://checkout.dodopayments.com/buy/pdt_0NXbRMq3TvlNcCzwLPfMt?quantity=1',
  pro_annual: 'https://checkout.dodopayments.com/buy/pdt_0NXbhGZNYqR0WbT4RcS6b?quantity=1',
  business: 'https://checkout.dodopayments.com/buy/pdt_0NXbhGZNYqR0WbT4RcS6b?quantity=1',
  business_annual: 'https://checkout.dodopayments.com/buy/pdt_0NXbhGZNYqR0WbT4RcS6b?quantity=1',
};

function getPlanDetails(basePlan: string, billingInterval: BillingInterval) {
  const pricing = PLAN_PRICING[basePlan];
  if (!pricing) return null;
  
  const isAnnual = billingInterval === 'annual';
  const planKey = isAnnual ? `${basePlan}_annual` : basePlan;
  return {
    price: isAnnual ? pricing.annual : pricing.monthly,
    period: isAnnual ? '/year' : '/month',
    pages: isAnnual 
      ? `${pricing.annualPages.toLocaleString()} pages/year` 
      : `${pricing.monthlyPages.toLocaleString()} pages/month`,
    planKey,
    checkoutUrl: DODO_CHECKOUT_URLS[planKey],
    monthlyEquivalent: isAnnual ? Math.round(pricing.annual / 12) : null,
  };
}

interface PricingSectionProps {
  variant?: 'full' | 'simplified';
}

const PricingSection = forwardRef<HTMLElement, PricingSectionProps>(({ variant = 'full' }, ref) => {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  const starterDetails = getPlanDetails('starter', billingInterval)!;
  const proDetails = getPlanDetails('pro', billingInterval)!;
  const businessDetails = getPlanDetails('business', billingInterval)!;

  return (
    <section ref={ref} id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Pricing & Usage
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you need more power. All prices in USD.
          </p>
        </div>

        {/* Billing Toggle - Only show in full variant */}
        {variant === 'full' && (
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Monthly
            </span>
            <Switch 
              checked={billingInterval === 'annual'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
            />
            <span className={cn(
              "text-sm font-medium transition-colors flex items-center gap-1.5",
              billingInterval === 'annual' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Annual
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Save 50%
              </span>
            </span>
          </div>
        )}

        {/* Free Tier Row */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto",
          variant === 'simplified' ? 'mb-6' : 'mb-6'
        )}>
          
          {/* Anonymous (No Signup) */}
          <div className="glass-card p-6 opacity-80">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Anonymous
              </h3>
              <span className="text-xs text-muted-foreground">(No Signup)</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                1 page every 24 hours
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                Excel output only
              </li>
              <li className="flex items-center gap-2 opacity-60">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="line-through">PII masking</span>
                <span className="text-xs">(not available)</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Max file size: 10 MB
              </li>
            </ul>

            <Button variant="outline" className="w-full" size="sm">
              Try Once Free
            </Button>
          </div>

          {/* Registered (Free) */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Registered
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Free
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">Registration is free</p>
            
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                5 pages every 24 hours
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Excel output only
              </li>
              <li className="flex items-center gap-2 opacity-60">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span>PII masking</span>
                <span className="text-xs italic">(starts from Starter)</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Max file size: 10 MB
              </li>
            </ul>

            <Link to="/signup">
              <Button variant="glass" className="w-full" size="sm">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Paid Plans Row - Only show in full variant */}
        {variant === 'full' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-6">

            {/* Starter (Paid) */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Starter
                </h3>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-bold text-foreground">${starterDetails.price}</span>
                <span className="text-muted-foreground">{starterDetails.period}</span>
              </div>
              
              {starterDetails.monthlyEquivalent && (
                <p className="text-xs text-primary mb-3">
                  ${starterDetails.monthlyEquivalent}/mo equivalent
                </p>
              )}

              <p className="text-xs text-muted-foreground mb-3">{starterDetails.pages}</p>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  Convert up to {billingInterval === 'annual' ? '4,800' : '400'} pages{billingInterval === 'annual' ? '/year' : '/month'}
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Excel & CSV output
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Automatic balance validation
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  Accounting software compatible
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  PII masking toggle
                </li>
              </ul>

              <Button 
                variant="glass" 
                className="w-full"
                onClick={() => window.location.href = starterDetails.checkoutUrl}
              >
                Upgrade / Buy Now
              </Button>
            </div>

            {/* Professional */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Professional
                </h3>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-bold text-foreground">${proDetails.price}</span>
                <span className="text-muted-foreground">{proDetails.period}</span>
              </div>
              
              {proDetails.monthlyEquivalent && (
                <p className="text-xs text-primary mb-3">
                  ${proDetails.monthlyEquivalent}/mo equivalent
                </p>
              )}

              <p className="text-xs text-muted-foreground mb-3">{proDetails.pages}</p>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  Everything in Starter
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Batch upload (up to 10 files)
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Merged output file
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  Priority rule updates
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  PII masking toggle
                </li>
              </ul>

              <Button 
                variant="glass" 
                className="w-full"
                onClick={() => window.location.href = proDetails.checkoutUrl}
              >
                Upgrade / Buy Now
              </Button>
            </div>

            {/* Business (Most Popular) */}
            <div className="glass-card p-6 border-2 border-primary/50 glow-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] text-xs font-semibold text-primary-foreground">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 mt-2">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Business
                </h3>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-bold text-foreground">${businessDetails.price}</span>
                <span className="text-muted-foreground">{businessDetails.period}</span>
              </div>
              
              {businessDetails.monthlyEquivalent && (
                <p className="text-xs text-primary mb-3">
                  ${businessDetails.monthlyEquivalent}/mo equivalent
                </p>
              )}

              <p className="text-xs text-muted-foreground mb-3">{businessDetails.pages}</p>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  Everything in Professional
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Batch upload (up to 20 files)
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Multi-bank merged output
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary" />
                  Priority email support
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  PII masking toggle
                </li>
              </ul>

              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => window.location.href = businessDetails.checkoutUrl}
              >
                Upgrade / Buy Now
              </Button>
            </div>

          </div>
        )}

        {/* Enterprise - Full Width */}
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-6 border border-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Enterprise
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For teams, high-volume usage, or custom requirements
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/contact", { state: { subject: "Enterprise inquiry" } })}
                className="sm:flex-shrink-0"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Secure payments • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
});

PricingSection.displayName = 'PricingSection';

export default PricingSection;