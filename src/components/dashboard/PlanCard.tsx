import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType, PiiMaskingLevel } from "@/hooks/use-usage";
import { Link } from "react-router-dom";

interface PlanCardProps {
  planName: PlanType;
  displayName: string;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  piiMasking: PiiMaskingLevel;
  pagesUsedToday: number;
  pagesUsedThisMonth?: number;
  isUnlimited: boolean;
}

const planIcons: Record<PlanType, typeof Zap> = {
  anonymous: Zap,
  registered_free: Zap,
  starter: Zap,
  starter_annual: Zap,
  pro: Zap,
  pro_annual: Zap,
  business: Crown,
  business_annual: Crown,
  lifetime: Rocket,
};

const planColors: Record<PlanType, string> = {
  anonymous: 'text-muted-foreground',
  registered_free: 'text-primary',
  starter: 'text-primary',
  starter_annual: 'text-primary',
  pro: 'text-primary',
  pro_annual: 'text-primary',
  business: 'text-primary',
  business_annual: 'text-primary',
  lifetime: 'text-warning',
};

export function PlanCard({
  planName,
  displayName,
  dailyLimit,
  monthlyLimit,
  piiMasking,
  pagesUsedToday,
  pagesUsedThisMonth = 0,
  isUnlimited
}: PlanCardProps) {
  const Icon = planIcons[planName] || planIcons.starter;
  const iconColor = planColors[planName] || planColors.starter;
  const isPaid = ['starter', 'starter_annual', 'pro', 'pro_annual', 'business', 'business_annual', 'lifetime'].includes(planName);
  
  // Determine billing interval from plan name
  const isAnnualPlan = planName.includes('annual');
  const isLifetime = planName === 'lifetime';
  
  // Determine if this plan uses monthly or daily limits
  const isMonthlyPlan = monthlyLimit !== null && dailyLimit === null;
  
  // Calculate usage based on limit type
  const currentUsage = isMonthlyPlan ? pagesUsedThisMonth : pagesUsedToday;
  const currentLimit = isMonthlyPlan ? monthlyLimit : dailyLimit;
  
  const usagePercent = !isUnlimited && currentLimit 
    ? Math.min(100, Math.round((currentUsage / currentLimit) * 100))
    : 0;

  // Labels based on billing interval
  const usageLabel = isAnnualPlan ? 'Yearly Usage' : 'Monthly Usage';
  const limitLabel = isAnnualPlan ? 'pages/year' : isMonthlyPlan ? 'pages/month' : 'pages/day';
  const billingLabel = isLifetime 
    ? 'Lifetime Access' 
    : isAnnualPlan 
      ? 'Annual Subscription' 
      : 'Monthly Subscription';

  return (
    <div className={cn(
      "glass-card p-6",
      planName === 'lifetime' && "border-warning/30",
      planName === 'business' && "border-primary/30"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            planName === 'lifetime' ? "bg-warning/10" : "bg-primary/10"
          )}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {displayName}
            </h3>
            <p className="text-xs text-muted-foreground">{billingLabel}</p>
          </div>
        </div>
        
        {!isPaid && (
          <Link to="/pricing">
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          </Link>
        )}
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{usageLabel}</span>
          <span className="text-foreground font-medium">
            {isUnlimited ? (
              'Unlimited'
            ) : (
              `${currentUsage} / ${currentLimit} pages`
            )}
          </span>
        </div>
        {!isUnlimited && (
          <Progress 
            value={usagePercent} 
            className={cn(
              "h-2",
              usagePercent >= 100 && "[&>div]:bg-destructive",
              usagePercent >= 80 && usagePercent < 100 && "[&>div]:bg-warning"
            )}
          />
        )}
        {isUnlimited && (
          <div className="h-2 bg-primary/20 rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-primary to-primary/50 rounded-full" />
          </div>
        )}
        {/* Show when limit resets */}
        {!isUnlimited && (
          <p className="text-xs text-muted-foreground mt-1">
            {isAnnualPlan 
              ? 'Resets on subscription anniversary' 
              : isMonthlyPlan 
                ? 'Resets on the 1st of each month' 
                : 'Resets at midnight UTC'}
          </p>
        )}
      </div>

      {/* Features */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            {isUnlimited ? 'Unlimited pages' : `${currentLimit} ${limitLabel}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className={cn(
            "w-4 h-4",
            piiMasking === 'none' ? "text-muted-foreground/50" : "text-primary"
          )} />
          <span className={cn(
            piiMasking === 'none' ? "text-muted-foreground/50 line-through" : "text-muted-foreground"
          )}>
            PII Masking {piiMasking === 'enforced' && '(Enforced)'}
            {piiMasking === 'optional' && '(Optional)'}
          </span>
        </div>
        {isPaid && (
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Priority processing</span>
          </div>
        )}
      </div>

      {/* Upgrade prompt for free users */}
      {!isPaid && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            Upgrade to <span className="text-primary font-medium">Starter</span> for 400 pages/month 
            with PII masking.
          </p>
        </div>
      )}
    </div>
  );
}
