import { useState, useEffect, memo } from "react";
import { FileText, Shield, Cog, CheckCircle, Play, RotateCcw, AlertTriangle, XCircle, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ExportOptionsDialog, { ExportType, ExportFormat } from "@/components/ExportOptionsDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUsageContext } from "@/contexts/UsageContext";
import { supabase } from "@/integrations/supabase/client";

interface TransactionRow {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  account?: string;
  // Validation fields
  validationStatus?: 'valid' | 'error' | 'warning';
  expectedBalance?: string;
  discrepancy?: string;
}

const sampleStatement: TransactionRow[] = [
  { date: "2025-01-15", description: "SALARY FROM ACME CORP - JOHN SMITH", debit: "", credit: "5,250.00", balance: "12,450.00", account: "****4521" },
  { date: "2025-01-16", description: "TRANSFER TO JANE DOE - ACC 9876543210", debit: "1,200.00", credit: "", balance: "11,250.00", account: "****4521" },
  { date: "2025-01-17", description: "AMAZON PURCHASE - ORDER #123-456", debit: "89.99", credit: "", balance: "11,160.01", account: "****4521" },
  { date: "2025-01-18", description: "STARBUCKS COFFEE - CARD ENDING 7890", debit: "12.50", credit: "", balance: "11,147.51", account: "****4521" },
  { date: "2025-01-19", description: "REFUND FROM WALMART - MARY JOHNSON", debit: "", credit: "45.00", balance: "11,192.51", account: "****4521" },
];

const scrubbedStatement: TransactionRow[] = [
  { date: "2025-01-15", description: "SALARY FROM ACME CORP - [REDACTED]", debit: "", credit: "5,250.00", balance: "12,450.00", account: "****XXXX" },
  { date: "2025-01-16", description: "TRANSFER TO [REDACTED] - ACC ****XXXX", debit: "1,200.00", credit: "", balance: "11,250.00", account: "****XXXX" },
  { date: "2025-01-17", description: "AMAZON PURCHASE - ORDER #XXX-XXX", debit: "89.99", credit: "", balance: "11,160.01", account: "****XXXX" },
  { date: "2025-01-18", description: "STARBUCKS COFFEE - CARD ENDING XXXX", debit: "12.50", credit: "", balance: "11,147.51", account: "****XXXX" },
  { date: "2025-01-19", description: "REFUND FROM WALMART - [REDACTED]", debit: "", credit: "45.00", balance: "11,192.51", account: "****XXXX" },
];

// Normalized statement with validation - includes one error and one warning for demo
const normalizedStatement: TransactionRow[] = [
  { date: "2025-01-15", description: "Salary - ACME CORP", debit: "", credit: "5,250.00", balance: "12,450.00", validationStatus: "valid" },
  { date: "2025-01-16", description: "Bank Transfer - Outgoing", debit: "1,200.00", credit: "", balance: "11,250.00", validationStatus: "valid" },
  { date: "2025-01-17", description: "Online Purchase - Amazon", debit: "89.99", credit: "", balance: "11,150.01", validationStatus: "error", expectedBalance: "11,160.01", discrepancy: "10.00" },
  { date: "2025-01-18", description: "Food & Beverage - Starbucks", debit: "12.50", credit: "", balance: "11,137.51", validationStatus: "warning", expectedBalance: "11,137.51", discrepancy: "0.00" },
  { date: "2025-01-19", description: "Refund - Walmart", debit: "", credit: "45.00", balance: "11,182.51", validationStatus: "valid" },
];

const stages = [
  { 
    icon: FileText, 
    label: "File Uploaded", 
    color: "from-blue-500 to-blue-600",
    description: "PDF parsed and data extracted"
  },
  { 
    icon: Shield, 
    label: "PII Scrubbing", 
    color: "from-amber-500 to-orange-500",
    description: "Personal information anonymized"
  },
  { 
    icon: Cog, 
    label: "Rule Application", 
    color: "from-violet-500 to-purple-600",
    description: "Bank-specific rules applied"
  },
  { 
    icon: CheckCircle, 
    label: "Balance Verified", 
    color: "from-primary to-[hsl(185,84%,45%)]",
    description: "Arithmetic validation complete"
  },
];

const InteractiveDemo = memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated, plan, allowedFormats } = useUsageContext();
  const [currentStage, setCurrentStage] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getCurrentData = (): TransactionRow[] => {
    if (currentStage <= 0) return sampleStatement;
    if (currentStage === 1) return scrubbedStatement;
    return normalizedStatement;
  };

  const getHighlightedFields = () => {
    if (currentStage === 1) return ["description", "account"];
    if (currentStage === 2) return ["description"];
    return [];
  };

  const getValidationStats = () => {
    const data = normalizedStatement;
    const total = data.length;
    const valid = data.filter(r => r.validationStatus === 'valid').length;
    const errors = data.filter(r => r.validationStatus === 'error').length;
    const warnings = data.filter(r => r.validationStatus === 'warning').length;
    return { total, valid, errors, warnings };
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowOutput(true);
        setIsPlaying(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, isPlaying]);

  const handleStart = () => {
    setCurrentStage(0);
    setIsPlaying(true);
    setShowOutput(false);
  };

  const handleReset = () => {
    setCurrentStage(-1);
    setIsPlaying(false);
    setShowOutput(false);
  };

  const handleExport = async (type: ExportType, format: ExportFormat) => {
    // Block export for unauthenticated users (demo only shows preview)
    if (!isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please sign in to download your data',
      });
      navigate('/login');
      return;
    }

    setIsExporting(true);

    try {
      // Prepare transactions for backend
      const transactions = normalizedStatement.map(row => ({
        date: row.date,
        description: row.description,
        debit: row.debit,
        credit: row.credit,
        balance: row.balance,
        account: row.account,
      }));

      // Route through backend for proper enforcement
      const { data, error } = await supabase.functions.invoke('generate-export', {
        body: {
          transactions,
          exportType: type,
          format,
          filename: 'demo_statement',
          pageCount: 1,
        }
      });

      if (error) {
        console.error('Export error:', error);
        toast.error('Export failed', {
          description: error.message || 'Failed to generate export',
        });
        return;
      }

      if (!data?.success) {
        // Handle specific error cases
        if (data?.requiresAuth) {
          toast.error('Authentication required', {
            description: 'Please sign in to download your data',
          });
          navigate('/login');
        } else if (data?.upgradeRequired) {
          toast.error('Upgrade required', {
            description: data.error || 'This feature requires a paid plan',
          });
        } else if (data?.quotaExceeded) {
          toast.error('Quota exceeded', {
            description: data.error || 'You have reached your usage limit',
          });
        } else {
          toast.error('Export failed', {
            description: data?.error || 'Failed to export file',
          });
        }
        return;
      }

      // Decode base64 content and download
      const csvContent = decodeURIComponent(escape(atob(data.content)));
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      toast.success(`Exported ${data.exportType === 'masked' ? 'anonymized' : 'full'} demo data`, {
        description: data.message || `File saved as ${data.filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Failed to export file',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const highlightedFields = getHighlightedFields();
  const currentData = getCurrentData();
  const validationStats = getValidationStats();
  const showValidation = currentStage >= 3 || showOutput;

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            See the <span className="text-gradient">Magic</span> in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how ClearlyLedger transforms raw bank statements into clean, standardized data
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={handleStart} 
            disabled={isPlaying}
            variant="glow"
            size="lg"
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {currentStage === -1 ? "Start Demo" : "Restart"}
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline"
            size="lg"
            className="gap-2"
            disabled={currentStage === -1}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Pipeline Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-wrap justify-between gap-2 sm:gap-4">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === currentStage;
                const isCompleted = index < currentStage;
                const isPending = index > currentStage;

                return (
                  <div 
                    key={stage.label}
                    className={`
                      flex-1 min-w-[80px] flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-500
                      ${isActive ? 'glass-card-strong scale-105' : ''}
                      ${isCompleted ? 'opacity-60' : ''}
                      ${isPending ? 'opacity-30' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500
                        ${isActive || isCompleted 
                          ? `bg-gradient-to-br ${stage.color}` 
                          : 'bg-muted border border-border'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive || isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-xs font-medium text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-100" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-[hsl(185,84%,45%)] transition-all duration-500 ease-out"
                style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
              />
            </div>

            {/* Stage description */}
            {currentStage >= 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in">
                {stages[currentStage]?.description}
              </p>
            )}
          </div>
        </div>

        {/* Data Preview */}
        <div className="max-w-5xl mx-auto">
          <div className="glass-card overflow-hidden">
            {/* Table Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-primary/80" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {currentStage === -1 ? "sample_statement.pdf" : 
                   currentStage < 2 ? "Processing..." : 
                   showOutput ? "output_ready.csv" : "Verifying..."}
                </span>
              </div>
              {showOutput && (
                <ExportOptionsDialog
                  filename="demo_statement"
                  onExport={handleExport}
                  disabled={!showOutput || isExporting}
                  piiMaskingLevel={plan?.piiMasking || 'none'}
                  isAuthenticated={isAuthenticated}
                  planName={plan?.displayName}
                  allowedFormats={allowedFormats}
                />
              )}
            </div>

            {/* Table Content */}
            <TooltipProvider>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      {showValidation && <th className="w-10 p-3"></th>}
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Debit</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Credit</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, index) => {
                      const hasError = showValidation && row.validationStatus === 'error';
                      const hasWarning = showValidation && row.validationStatus === 'warning';
                      const isValid = showValidation && row.validationStatus === 'valid';
                      
                      return (
                        <tr 
                          key={index}
                          className={`
                            border-b transition-all duration-500
                            ${currentStage >= 0 ? 'animate-fade-in' : ''}
                            ${hasError ? 'bg-destructive/10 border-destructive/30' : ''}
                            ${hasWarning ? 'bg-amber-500/10 border-amber-500/30' : ''}
                            ${!hasError && !hasWarning ? 'border-border/30' : ''}
                          `}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {showValidation && (
                            <td className="p-3">
                              {hasError && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                                      <XCircle className="w-4 h-4 text-destructive" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-destructive">Balance Mismatch</p>
                                      <p className="text-xs">Expected: {row.expectedBalance}</p>
                                      <p className="text-xs">Actual: {row.balance}</p>
                                      <p className="text-xs font-medium">Discrepancy: ${row.discrepancy}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hasWarning && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-amber-500">Possible Issue</p>
                                      <p className="text-xs">Balance verified but flagged for review</p>
                                      <p className="text-xs">Check debit/credit assignment</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {isValid && (
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </td>
                          )}
                          <td className="p-3 text-foreground font-mono text-xs">{row.date}</td>
                          <td className={`p-3 transition-colors duration-300 ${
                            highlightedFields.includes("description") ? 'text-primary font-medium' : 'text-foreground'
                          }`}>
                            {row.description}
                          </td>
                          <td className={`p-3 text-right font-mono ${row.debit ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {row.debit || "—"}
                          </td>
                          <td className={`p-3 text-right font-mono ${row.credit ? 'text-primary' : 'text-muted-foreground'}`}>
                            {row.credit || "—"}
                          </td>
                          <td className={`p-3 text-right font-mono font-medium ${
                            hasError ? 'text-destructive' : hasWarning ? 'text-amber-500' : 'text-foreground'
                          }`}>
                            {row.balance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TooltipProvider>

            {/* Validation Result */}
            {showOutput && (
              <div className={`p-4 border-t animate-fade-in ${
                validationStats.errors > 0 
                  ? 'bg-destructive/5 border-destructive/30' 
                  : validationStats.warnings > 0 
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-primary/5 border-border/50'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      validationStats.errors > 0 
                        ? 'bg-destructive/20' 
                        : validationStats.warnings > 0 
                          ? 'bg-amber-500/20'
                          : 'bg-primary/20'
                    }`}>
                      {validationStats.errors > 0 ? (
                        <XCircle className="w-5 h-5 text-destructive" />
                      ) : validationStats.warnings > 0 ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        validationStats.errors > 0 
                          ? 'text-destructive' 
                          : validationStats.warnings > 0 
                            ? 'text-amber-500'
                            : 'text-foreground'
                      }`}>
                        {validationStats.errors > 0 
                          ? 'Validation Issues Found' 
                          : validationStats.warnings > 0 
                            ? 'Validation Passed with Warnings'
                            : 'Validation Passed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance[n-1] + Credit[n] − Debit[n] = Balance[n]
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-primary/60" />
                        <span className="text-xs text-muted-foreground">{validationStats.valid} valid</span>
                      </div>
                      {validationStats.errors > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-destructive/60" />
                          <span className="text-xs text-destructive">{validationStats.errors} error</span>
                        </div>
                      )}
                      {validationStats.warnings > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                          <span className="text-xs text-amber-500">{validationStats.warnings} warning</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{validationStats.total} transactions</p>
                      <p className="text-xs text-muted-foreground">
                        {validationStats.errors > 0 ? 'Review required' : 'Ready for export'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {currentStage === -1 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Click "Start Demo" to see the processing pipeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

InteractiveDemo.displayName = 'InteractiveDemo';

export default InteractiveDemo;
