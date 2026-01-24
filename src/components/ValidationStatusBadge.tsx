import { CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ValidationVerdict = 'EXPORT_COMPLETE' | 'EXPORT_INCOMPLETE' | 'EXPORT_BLOCKED' | 'VALIDATING';

interface ValidationStatusBadgeProps {
  verdict: ValidationVerdict;
  confidence: number;
  transactionCount: number;
  missingCount?: number;
  errorCount?: number;
  warningCount?: number;
  className?: string;
}

const ValidationStatusBadge = ({
  verdict,
  confidence,
  transactionCount,
  missingCount = 0,
  errorCount = 0,
  warningCount = 0,
  className,
}: ValidationStatusBadgeProps) => {
  const getVerdictConfig = () => {
    switch (verdict) {
      case 'EXPORT_COMPLETE':
        return {
          icon: CheckCircle,
          label: 'Validated',
          description: `${transactionCount} transactions ready to export`,
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          iconColor: 'text-emerald-500',
        };
      case 'EXPORT_INCOMPLETE':
        return {
          icon: AlertTriangle,
          label: 'Warnings',
          description: warningCount > 0 
            ? `${warningCount} transaction(s) have minor discrepancies`
            : `${missingCount || errorCount} issue(s) detected`,
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          textColor: 'text-amber-600 dark:text-amber-400',
          iconColor: 'text-amber-500',
        };
      case 'EXPORT_BLOCKED':
        return {
          icon: XCircle,
          label: 'Blocked',
          description: `${errorCount} validation error(s) must be fixed`,
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          textColor: 'text-destructive',
          iconColor: 'text-destructive',
        };
      case 'VALIDATING':
        return {
          icon: Loader2,
          label: 'Validating',
          description: 'Checking data integrity...',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/30',
          textColor: 'text-primary',
          iconColor: 'text-primary',
        };
      default:
        return {
          icon: AlertTriangle,
          label: 'Unknown',
          description: 'Validation status unknown',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          textColor: 'text-muted-foreground',
          iconColor: 'text-muted-foreground',
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
              config.bgColor,
              config.borderColor,
              className
            )}
          >
            <Icon 
              className={cn(
                "w-4 h-4 shrink-0",
                config.iconColor,
                verdict === 'VALIDATING' && "animate-spin"
              )} 
            />
            <div className="flex flex-col">
              <span className={cn("text-sm font-medium", config.textColor)}>
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {transactionCount} txns • {confidencePercent}% confidence
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.description}</p>
            {missingCount > 0 && (
              <p className="text-xs text-destructive">• {missingCount} missing transaction(s)</p>
            )}
            {errorCount > 0 && (
              <p className="text-xs text-destructive">• {errorCount} balance error(s)</p>
            )}
            {warningCount > 0 && (
              <p className="text-xs text-amber-500">• {warningCount} warning(s)</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Confidence: {confidencePercent}% based on data matching
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ValidationStatusBadge;
