import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, FileWarning, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ExportValidationResult, MissingTransaction, CorruptedTransaction } from "@/lib/ruleEngine/exportValidator";

interface ExportValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationResult: ExportValidationResult;
  onProceed?: () => void;
  onCancel?: () => void;
  canProceed?: boolean;
}

const ExportValidationDialog = ({
  open,
  onOpenChange,
  validationResult,
  onProceed,
  onCancel,
  canProceed = true,
}: ExportValidationDialogProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const { export_validation, missing_transactions, corrupted_transactions, duplicates_in_csv, confidence_score, verdict } = validationResult;

  const isComplete = verdict === 'EXPORT_COMPLETE';
  const hasMissing = missing_transactions.length > 0;
  const hasCorrupted = corrupted_transactions.length > 0;
  const hasDuplicates = duplicates_in_csv.length > 0;
  
  const getVerdictDisplay = () => {
    if (isComplete) {
      return {
        icon: CheckCircle,
        title: "Export Validation Passed",
        description: "All transactions verified successfully. Your data is ready to export.",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
      };
    }
    if (hasMissing) {
      return {
        icon: XCircle,
        title: "Export Validation Failed",
        description: `${missing_transactions.length} transaction(s) would be missing from the export.`,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      };
    }
    return {
      icon: AlertTriangle,
      title: "Export Has Warnings",
      description: "Some data quality issues were detected but export can proceed.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    };
  };

  const verdictDisplay = getVerdictDisplay();
  const VerdictIcon = verdictDisplay.icon;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyIssueDetails = () => {
    const lines = [
      `Export Validation Report`,
      `========================`,
      `Verdict: ${verdict}`,
      `Confidence: ${Math.round(confidence_score * 100)}%`,
      `PDF Transactions: ${export_validation.pdf_transactions}`,
      `Exported Rows: ${export_validation.exported_rows}`,
      ``,
    ];

    if (hasMissing) {
      lines.push(`Missing Transactions (${missing_transactions.length}):`);
      missing_transactions.forEach((tx, i) => {
        lines.push(`  ${i + 1}. ${tx.date} - ${tx.description} - ${formatAmount(tx.amount)}`);
      });
      lines.push('');
    }

    if (hasCorrupted) {
      lines.push(`Corrupted Data (${corrupted_transactions.length}):`);
      corrupted_transactions.forEach((tx, i) => {
        lines.push(`  ${i + 1}. Row ${tx.row_id}: ${tx.issue} - ${tx.field} (PDF: ${tx.pdf_value}, Export: ${tx.export_value})`);
      });
      lines.push('');
    }

    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-primary" />
            Export Validation
          </DialogTitle>
          <DialogDescription>
            Cross-validation results between PDF source and export data
          </DialogDescription>
        </DialogHeader>

        {/* Verdict Banner */}
        <div className={cn("p-4 rounded-lg", verdictDisplay.bgColor)}>
          <div className="flex items-start gap-3">
            <VerdictIcon className={cn("w-6 h-6 shrink-0", verdictDisplay.color)} />
            <div className="flex-1">
              <h4 className={cn("font-semibold", verdictDisplay.color)}>
                {verdictDisplay.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {verdictDisplay.description}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold text-foreground">{export_validation.pdf_transactions}</p>
            <p className="text-xs text-muted-foreground">PDF Transactions</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold text-foreground">{export_validation.exported_rows}</p>
            <p className="text-xs text-muted-foreground">Exported Rows</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className={cn(
              "text-2xl font-bold",
              confidence_score >= 0.95 ? "text-emerald-500" :
              confidence_score >= 0.8 ? "text-amber-500" : "text-destructive"
            )}>
              {Math.round(confidence_score * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
        </div>

        {/* Issue Summary */}
        {(!isComplete) && (
          <div className="space-y-2">
            {hasMissing && (
              <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-sm">
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
                <span className="text-destructive font-medium">
                  {missing_transactions.length} missing transaction(s)
                </span>
              </div>
            )}
            {hasCorrupted && (
              <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {corrupted_transactions.length} data discrepancy(s)
                </span>
              </div>
            )}
            {hasDuplicates && (
              <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {duplicates_in_csv.length} potential duplicate(s)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Detailed Issues (Expandable) */}
        {(!isComplete) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between"
            >
              <span>View Detailed Issues</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showDetails && (
              <ScrollArea className="h-48 mt-2 rounded-lg border border-border">
                <div className="p-3 space-y-4">
                  {/* Missing Transactions */}
                  {hasMissing && (
                    <div>
                      <h5 className="text-sm font-semibold text-destructive mb-2">
                        Missing Transactions
                      </h5>
                      <div className="space-y-2">
                        {missing_transactions.slice(0, 10).map((tx, i) => (
                          <MissingRow key={i} transaction={tx} index={i} />
                        ))}
                        {missing_transactions.length > 10 && (
                          <p className="text-xs text-muted-foreground">
                            ...and {missing_transactions.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Corrupted Data */}
                  {hasCorrupted && (
                    <div>
                      <h5 className="text-sm font-semibold text-amber-500 mb-2">
                        Data Discrepancies
                      </h5>
                      <div className="space-y-2">
                        {corrupted_transactions.slice(0, 10).map((tx, i) => (
                          <CorruptedRow key={i} transaction={tx} index={i} />
                        ))}
                        {corrupted_transactions.length > 10 && (
                          <p className="text-xs text-muted-foreground">
                            ...and {corrupted_transactions.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" size="sm" onClick={copyIssueDetails} className="gap-1">
            <Copy className="w-3 h-3" />
            Copy Report
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onCancel || (() => onOpenChange(false))}>
            Cancel
          </Button>
          {canProceed && !hasMissing && (
            <Button onClick={onProceed} className="gap-2">
              <Download className="w-4 h-4" />
              {isComplete ? 'Export Now' : 'Export Anyway'}
            </Button>
          )}
          {hasMissing && (
            <Button disabled variant="destructive" className="gap-2">
              <XCircle className="w-4 h-4" />
              Export Blocked
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper Components
const MissingRow = ({ transaction, index }: { transaction: MissingTransaction; index: number }) => (
  <div className="flex items-center gap-2 p-2 rounded bg-destructive/5 text-xs">
    <span className="font-mono text-muted-foreground">#{index + 1}</span>
    <span className="font-medium">{transaction.date}</span>
    <span className="text-muted-foreground truncate flex-1">{transaction.description.substring(0, 30)}...</span>
    <span className={transaction.type === 'debit' ? 'text-destructive' : 'text-emerald-500'}>
      {transaction.type === 'debit' ? '-' : '+'}{transaction.amount.toLocaleString()}
    </span>
  </div>
);

const CorruptedRow = ({ transaction, index }: { transaction: CorruptedTransaction; index: number }) => (
  <div className="flex items-center gap-2 p-2 rounded bg-amber-500/5 text-xs">
    <span className="font-mono text-muted-foreground">Row {transaction.row_id}</span>
    <span className="font-medium capitalize">{transaction.issue.replace('_', ' ')}</span>
    <span className="text-muted-foreground">
      {transaction.field}: {String(transaction.pdf_value)} → {String(transaction.export_value)}
    </span>
  </div>
);

export default ExportValidationDialog;
