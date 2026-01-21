import { useState, useEffect } from "react";
import { User, UserPlus, Zap, Crown, Rocket, Shield, Check, Sparkles, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUsage } from "@/hooks/use-usage";
import { Link, useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();
  const { lifetimeSpotsRemaining } = useUsage();
  const spotsRemaining = lifetimeSpotsRemaining ?? 350;
  const isSoldOut = spotsRemaining <= 0;
  const isLowStock = spotsRemaining <= 50 && spotsRemaining > 0;

  const handleEnterpriseClick = () => {
    navigate("/contact", { state: { subject: "Enterprise inquiry" } });
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
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Anonymous - Try It (Small, low emphasis) */}
          <div className="glass-card p-6 opacity-80">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Anonymous
              </h3>
              <span className="text-xs text-muted-foreground">(Try It)</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                1 page every 24 hours
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                Normal Excel only
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                No history, no masking
              </li>
            </ul>

            <Button variant="outline" className="w-full" size="sm">
              Try Once Free
            </Button>
          </div>

          {/* Registered Free (Neutral emphasis) */}
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
            
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                5 pages every 24 hours
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Normal Excel only
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                See pages used
              </li>
            </ul>

            <Link to="/signup">
              <Button variant="glass" className="w-full" size="sm">
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Pro - Most Popular (HIGHLIGHTED) */}
          <div className="glass-card p-6 border-2 border-primary/50 glow-primary relative md:col-span-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] text-xs font-semibold text-primary-foreground">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">
                Pro
              </h3>
            </div>
            
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-3xl font-bold text-foreground">$19</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Designed for real usage</p>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-primary" />
                Unlimited pages
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Faster processing
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-primary" />
                PII masking option
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Full usage tracking
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Normal or masked Excel
              </li>
            </ul>

            {/* Social proof */}
            <p className="text-xs text-primary mb-4 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Most users upgrade to Pro
            </p>

            <Button variant="hero" className="w-full">
              Upgrade to Pro
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Avoid daily limits and manual cleanup
            </p>
          </div>

          {/* Lifetime - Best Value */}
          <div className="glass-card p-6 border border-warning/30 bg-warning/5 relative md:col-span-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold border border-warning/30">
                <Rocket className="w-3 h-3" />
                Best Value • Limited Spots
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-2">
              <Rocket className="w-5 h-5 text-warning" />
              <h3 className="font-display text-xl font-bold text-foreground">
                Lifetime
              </h3>
            </div>
            
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-3xl font-bold text-foreground">$119</span>
              <span className="text-muted-foreground">one-time</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Everything in Pro, forever.</p>
            
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-warning" />
                Unlimited pages
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <Check className="w-4 h-4 text-warning" />
                PII masking included
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-warning" />
                No monthly fees
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-warning" />
                Priority processing
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
              disabled={isSoldOut}
            >
              {isSoldOut ? 'Sold Out' : 'Get Lifetime Access'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Pay once. Use forever.
            </p>
          </div>
        </div>

        {/* Enterprise - Full Width */}
        <div className="max-w-4xl mx-auto mt-6">
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
            Secure payment • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
