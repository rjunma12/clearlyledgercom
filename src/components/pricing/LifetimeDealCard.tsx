import { Button } from "@/components/ui/button";
import { Check, Clock, Rocket, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifetimeDealCardProps {
  spotsRemaining: number | null;
  totalSpots: number;
  onCtaClick?: () => void;
}

export function LifetimeDealCard({ 
  spotsRemaining, 
  totalSpots,
  onCtaClick 
}: LifetimeDealCardProps) {
  const isSoldOut = spotsRemaining !== null && spotsRemaining <= 0;
  const isLowStock = spotsRemaining !== null && spotsRemaining <= 50 && spotsRemaining > 0;
  const percentSold = spotsRemaining !== null 
    ? Math.round(((totalSpots - spotsRemaining) / totalSpots) * 100)
    : 0;

  return (
    <div className="glass-card p-6 sm:p-8 gradient-border relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-warning" />
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Lifetime Deal
                </h3>
              </div>
              
              {isSoldOut ? (
                <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/30">
                  Sold Out
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold border border-warning/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Only {spotsRemaining} left!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold border border-warning/30">
                  Limited to {totalSpots} users
                </span>
              )}
            </div>

            <p className="text-muted-foreground mb-4 max-w-xl">
              One-time payment of{' '}
              <span className="text-foreground font-bold text-xl">$119</span>
              {' '}for unlimited pages forever. Join our early supporters and lock in lifetime access.
            </p>

            {/* Progress bar */}
            {!isSoldOut && spotsRemaining !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{totalSpots - spotsRemaining} claimed</span>
                  <span>{spotsRemaining} remaining</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-warning to-warning/80 rounded-full transition-all duration-500"
                    style={{ width: `${percentSold}%` }}
                  />
                </div>
              </div>
            )}

            {/* Features */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                Unlimited pages forever
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                All Business features
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                Priority processing
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                Early access to new features
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                No recurring billing
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <Button
              variant="glass"
              size="lg"
              className={cn(
                "w-full lg:w-auto min-w-[180px]",
                !isSoldOut && "bg-gradient-to-r from-warning/20 to-warning/10 border-warning/30 hover:border-warning/50"
              )}
              onClick={onCtaClick}
              disabled={isSoldOut}
            >
              {isSoldOut ? 'Sold Out' : 'Get Lifetime Access'}
            </Button>
            {!isSoldOut && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                One-time payment • No subscription
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
