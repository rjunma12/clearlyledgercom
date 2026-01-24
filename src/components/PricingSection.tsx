import { memo } from "react";
import { User, UserPlus, Zap, Rocket, Shield, Check, Sparkles, Building2, FileText, Briefcase, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUsageContext } from "@/contexts/UsageContext";
import { useCheckout, PlanName } from "@/hooks/use-checkout";
import { Link, useNavigate } from "react-router-dom";

const PricingSection = memo(() => {
  const navigate = useNavigate();
  const { lifetimeSpotsRemaining } = useUsageContext();
  const { isLoading, loadingPlan, initiateCheckout } = useCheckout();
  const spotsRemaining = lifetimeSpotsRemaining ?? 350;
  const isSoldOut = spotsRemaining <= 0;
  const isLowStock = spotsRemaining <= 50 && spotsRemaining > 0;

  const handleEnterpriseClick = () => {
    navigate("/contact", { state: { subject: "Enterprise inquiry" } });
  };

  const handlePlanClick = (planName: PlanName) => {
    initiateCheckout(planName);
  };

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
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

        {/* Free Tier Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
          
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

        {/* Paid Plans Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-6">

          {/* Starter (Paid) */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">
                Starter
              </h3>
            </div>
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">$15</span>
              <span className="text-muted-foreground">/ month</span>
            </div>

            <p className="text-xs text-muted-foreground mb-3">400 pages per month</p>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Convert up to 400 pages/month
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
              onClick={() => handlePlanClick('starter')}
              disabled={isLoading}
            >
              {loadingPlan === 'starter' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Starter'
              )}
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
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">$30</span>
              <span className="text-muted-foreground">/ month</span>
            </div>

            <p className="text-xs text-muted-foreground mb-3">1,000 pages per month</p>
            
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
              onClick={() => handlePlanClick('pro')}
              disabled={isLoading}
            >
              {loadingPlan === 'pro' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Professional'
              )}
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
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">$50</span>
              <span className="text-muted-foreground">/ month</span>
            </div>

            <p className="text-xs text-muted-foreground mb-3">4,000 pages per month</p>
            
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
              onClick={() => handlePlanClick('business')}
              disabled={isLoading}
            >
              {loadingPlan === 'business' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Get Business'
              )}
            </Button>
          </div>

          {/* Lifetime (Best Value) */}
          <div className="glass-card p-6 border border-warning/30 bg-warning/5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold border border-warning/30">
                <Rocket className="w-3 h-3" />
                Best Value • Limited
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-2">
              <Rocket className="w-5 h-5 text-warning" />
              <h3 className="font-display text-xl font-bold text-foreground">
                Lifetime
              </h3>
            </div>
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">$119</span>
              <span className="text-muted-foreground">one-time</span>
            </div>

            <p className="text-xs text-muted-foreground mb-3">500 pages per month, forever</p>
            
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-warning" />
                Lifetime access
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-warning" />
                500 pages/month
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-warning" />
                All Business features
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 text-warning" />
                PII masking toggle
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-warning" />
                No monthly fees ever
              </li>
            </ul>

            {/* Scarcity indicator */}
            {!isSoldOut && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Limited to 350 users</span>
                  <span className={cn(isLowStock && "text-warning font-medium")}>
                    {spotsRemaining} left
                  </span>
                </div>
                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-warning to-warning/80 rounded-full transition-all duration-500"
                    style={{ width: `${((350 - spotsRemaining) / 350) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button 
              variant="glass" 
              className={cn(
                "w-full",
                !isSoldOut && "bg-warning/10 border-warning/30 hover:border-warning/50 hover:bg-warning/20"
              )}
              disabled={isSoldOut || isLoading}
              onClick={() => handlePlanClick('lifetime')}
            >
              {loadingPlan === 'lifetime' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isSoldOut ? (
                'Sold Out'
              ) : (
                'Get Lifetime Access'
              )}
            </Button>
          </div>
        </div>

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
                onClick={handleEnterpriseClick}
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
            Secure payment via Dodo • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
});

PricingSection.displayName = 'PricingSection';

export default PricingSection;
