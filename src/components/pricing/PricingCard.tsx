import { Button } from "@/components/ui/button";
import { Check, Sparkles, Clock, Zap, Shield, Users, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  highlight?: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  badgeVariant?: 'popular' | 'limited' | 'free';
  description: string;
  features: PricingFeature[];
  cta: string;
  ctaVariant?: 'default' | 'hero' | 'glass' | 'outline';
  isPopular?: boolean;
  isLarge?: boolean;
  icon?: React.ReactNode;
  onCtaClick?: () => void;
  disabled?: boolean;
  usageIndicator?: string;
}

export function PricingCard({
  name,
  price,
  period,
  badge,
  badgeVariant = 'popular',
  description,
  features,
  cta,
  ctaVariant = 'glass',
  isPopular = false,
  isLarge = false,
  icon,
  onCtaClick,
  disabled = false,
  usageIndicator
}: PricingCardProps) {
  const badgeStyles = {
    popular: 'bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] text-primary-foreground',
    limited: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    free: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  };

  return (
    <div
      className={cn(
        "relative glass-card p-6 sm:p-8 flex flex-col transition-all duration-300",
        isPopular && "glow-primary border-primary/30 scale-[1.02]",
        isLarge && "md:col-span-1",
        "hover:border-primary/20"
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
            badgeStyles[badgeVariant]
          )}>
            {badgeVariant === 'popular' && <Sparkles className="w-3 h-3" />}
            {badgeVariant === 'limited' && <Clock className="w-3 h-3" />}
            {badge}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-display text-xl font-semibold text-foreground">
            {name}
          </h3>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-display text-4xl font-bold text-foreground">
            {price}
          </span>
          {period && (
            <span className="text-muted-foreground">{period}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Usage Indicator */}
      {usageIndicator && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-foreground mb-6 w-fit">
          <Clock className="w-4 h-4 text-primary" />
          {usageIndicator}
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={cn(
              "w-5 h-5 flex-shrink-0 mt-0.5",
              feature.highlight ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm",
              feature.highlight ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={ctaVariant === 'hero' ? 'hero' : ctaVariant === 'outline' ? 'outline' : 'glass'}
        className="w-full"
        onClick={onCtaClick}
        disabled={disabled}
      >
        {cta}
      </Button>
    </div>
  );
}
