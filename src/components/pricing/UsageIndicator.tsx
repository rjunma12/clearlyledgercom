import { cn } from "@/lib/utils";
import { Infinity, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UsageIndicatorProps {
  pagesUsed: number;
  pagesRemaining: number;
  dailyLimit: number | null;
  isUnlimited: boolean;
  className?: string;
  variant?: 'compact' | 'full';
}

export function UsageIndicator({
  pagesUsed,
  pagesRemaining,
  dailyLimit,
  isUnlimited,
  className,
  variant = 'compact'
}: UsageIndicatorProps) {
  if (isUnlimited) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm",
        className
      )}>
        <Infinity className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground">Unlimited pages</span>
      </div>
    );
  }

  const percentUsed = dailyLimit ? Math.round((pagesUsed / dailyLimit) * 100) : 0;
  const isNearLimit = percentUsed >= 80;
  const isAtLimit = pagesRemaining <= 0;

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm",
        className
      )}>
        <Clock className={cn(
          "w-4 h-4",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-primary"
        )} />
        <span className={cn(
          isAtLimit ? "text-destructive" : "text-muted-foreground"
        )}>
          {pagesUsed} / {dailyLimit} pages used today
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Daily usage</span>
        <span className={cn(
          "font-medium",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-foreground"
        )}>
          {pagesUsed} / {dailyLimit} pages
        </span>
      </div>
      <Progress 
        value={percentUsed} 
        className={cn(
          "h-2",
          isAtLimit && "[&>div]:bg-destructive",
          isNearLimit && !isAtLimit && "[&>div]:bg-warning"
        )}
      />
      {isAtLimit && (
        <p className="text-xs text-destructive">
          Daily limit reached. Upgrade for unlimited access.
        </p>
      )}
    </div>
  );
}
