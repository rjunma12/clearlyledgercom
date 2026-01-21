import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'warning';
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  variant = 'default'
}: StatCardProps) {
  return (
    <div className={cn(
      "glass-card p-5",
      variant === 'primary' && "border-primary/30 bg-primary/5",
      variant === 'warning' && "border-warning/30 bg-warning/5"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={cn(
            "font-display text-2xl font-bold",
            variant === 'primary' && "text-primary",
            variant === 'warning' && "text-warning",
            variant === 'default' && "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs mt-1",
              trend.value >= 0 ? "text-primary" : "text-destructive"
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn(
          "p-2.5 rounded-lg",
          variant === 'primary' && "bg-primary/10",
          variant === 'warning' && "bg-warning/10",
          variant === 'default' && "bg-muted"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            variant === 'primary' && "text-primary",
            variant === 'warning' && "text-warning",
            variant === 'default' && "text-muted-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}
