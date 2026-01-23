/**
 * BatchProcessingSection - Dashboard section for batch file processing
 * Shows batch upload for Pro/Business users, upgrade prompt for others
 */

import { useState } from 'react';
import { 
  Files, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download,
  Copy,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BatchFileUpload from '@/components/BatchFileUpload';
import { useUsage } from '@/hooks/use-usage';
import { 
  processBatchPDFs, 
  BatchProcessingResult, 
  BatchFileStatus 
} from '@/lib/batchPdfProcessor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BatchProcessingSectionProps {
  className?: string;
}

export function BatchProcessingSection({ className }: BatchProcessingSectionProps) {
  const { canBatchUpload, maxBatchFiles, plan } = useUsage();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<BatchFileStatus[]>([]);
  const [result, setResult] = useState<BatchProcessingResult | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setFileStatuses(selectedFiles.map(f => ({
      fileName: f.name,
      status: 'pending' as const,
      progress: 0,
    })));
    setResult(null);
  };

  const handleProcessBatch = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setOverallProgress(0);
    setResult(null);

    try {
      const batchResult = await processBatchPDFs(files, {
        onFileProgress: (fileIndex, fileName, progress, stage) => {
          setFileStatuses(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'processing',
              progress,
            };
            return updated;
          });
          
          // Calculate overall progress
          const totalProgress = fileStatuses.reduce((sum, s) => sum + (s.progress || 0), 0);
          setOverallProgress(Math.round(totalProgress / files.length));
        },
        onFileComplete: (fileIndex, fileName, result) => {
          setFileStatuses(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'complete',
              progress: 100,
              pageCount: result.document?.totalPages,
              transactionCount: result.document?.totalTransactions,
            };
            return updated;
          });
        },
        onFileError: (fileIndex, fileName, error) => {
          setFileStatuses(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'error',
              error: error.message,
            };
            return updated;
          });
        },
        mergeOptions: {
          sortByDate: true,
          addSourceColumn: true,
          duplicateDetection: { enabled: true },
        },
      });

      setResult(batchResult);
      setOverallProgress(100);

      if (batchResult.success) {
        toast.success('Batch processing complete', {
          description: `Merged ${batchResult.totalTransactions} transactions from ${files.length} files`,
        });
      } else {
        toast.error('Batch processing failed', {
          description: batchResult.errors[0] || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error('Processing failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportMerged = () => {
    if (!result?.mergedDocument) return;

    const transactions = result.mergedDocument.segments.flatMap(s => s.transactions);
    
    // Build CSV with source file column
    const hasSourceColumn = transactions.some(tx => (tx as any).sourceFileName);
    const headers = hasSourceColumn 
      ? ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Source File', 'Status']
      : ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Status'];

    const rows = transactions.map(tx => {
      const baseRow = [
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.debit?.toFixed(2) || '',
        tx.credit?.toFixed(2) || '',
        tx.balance.toFixed(2),
      ];
      
      if (hasSourceColumn) {
        baseRow.push(`"${(tx as any).sourceFileName || ''}"`);
      }
      
      baseRow.push(tx.validationStatus || 'valid');
      return baseRow.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_statements_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Export complete', {
      description: `Downloaded merged_statements.csv`,
    });
  };

  const handleClearResults = () => {
    setFiles([]);
    setFileStatuses([]);
    setResult(null);
    setOverallProgress(0);
  };

  // Don't show for non-premium users (they'll see BatchFileUpload's upgrade prompt)
  if (!canBatchUpload) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Files className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Batch Processing
          </h2>
        </div>
        <BatchFileUpload
          onFilesSelected={() => {}}
          onProcessBatch={() => {}}
          isProcessing={false}
          fileStatuses={[]}
        />
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Files className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Batch Processing
          </h2>
          <Badge variant="secondary" className="text-xs">
            {plan?.displayName}
          </Badge>
        </div>
        {result && (
          <Button variant="ghost" size="sm" onClick={handleClearResults}>
            Clear Results
          </Button>
        )}
      </div>

      {!result ? (
        <>
          <BatchFileUpload
            onFilesSelected={handleFilesSelected}
            onProcessBatch={handleProcessBatch}
            isProcessing={isProcessing}
            fileStatuses={fileStatuses}
            maxFiles={maxBatchFiles}
          />
          
          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </>
      ) : (
        <BatchResultsDisplay 
          result={result} 
          onExport={handleExportMerged}
          onProcessAnother={handleClearResults}
        />
      )}
    </div>
  );
}

interface BatchResultsDisplayProps {
  result: BatchProcessingResult;
  onExport: () => void;
  onProcessAnother: () => void;
}

function BatchResultsDisplay({ result, onExport, onProcessAnother }: BatchResultsDisplayProps) {
  const hasDuplicates = result.duplicates?.detected;
  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0 || hasDuplicates;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className={cn(
        "p-4 rounded-lg border",
        hasErrors 
          ? "bg-destructive/5 border-destructive/30" 
          : hasWarnings 
            ? "bg-amber-500/5 border-amber-500/30"
            : "bg-primary/5 border-primary/30"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            hasErrors 
              ? "bg-destructive/20" 
              : hasWarnings 
                ? "bg-amber-500/20"
                : "bg-primary/20"
          )}>
            {hasErrors ? (
              <XCircle className="w-5 h-5 text-destructive" />
            ) : hasWarnings ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium",
              hasErrors ? "text-destructive" : hasWarnings ? "text-amber-600 dark:text-amber-400" : "text-foreground"
            )}>
              {hasErrors 
                ? 'Processing Completed with Errors' 
                : hasWarnings 
                  ? 'Processing Completed with Warnings'
                  : 'Processing Completed Successfully'}
            </h3>
            
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{result.fileStatuses.filter(f => f.status === 'complete').length} files merged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Copy className="w-4 h-4" />
                <span>{result.totalTransactions} transactions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{(result.totalProcessingTime / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Warning */}
      {hasDuplicates && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                {result.duplicates.totalFlagged} Potential Duplicate{result.duplicates.totalFlagged !== 1 ? 's' : ''} Detected
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.duplicates.groups.length} group{result.duplicates.groups.length !== 1 ? 's' : ''} of 
                transactions with matching dates, amounts, and similar descriptions were found 
                across different files. Review these in the exported file (marked as warnings).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Status List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Files Processed</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {result.fileStatuses.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                file.status === 'error' 
                  ? "bg-destructive/5 border-destructive/30"
                  : "bg-muted/30 border-border"
              )}
            >
              {file.status === 'complete' ? (
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              ) : file.status === 'error' ? (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.fileName}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {file.pageCount !== undefined && <span>{file.pageCount} pages</span>}
                  {file.transactionCount !== undefined && <span>• {file.transactionCount} transactions</span>}
                  {file.error && <span className="text-destructive">{file.error}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button 
          onClick={onExport} 
          variant="glow" 
          className="flex-1 gap-2"
          disabled={!result.success}
        >
          <Download className="w-4 h-4" />
          Export Merged CSV
        </Button>
        <Button 
          onClick={onProcessAnother} 
          variant="outline"
        >
          Process Another Batch
        </Button>
      </div>
    </div>
  );
}

export default BatchProcessingSection;
