import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { processPDF } from "@/lib/pdfProcessor";
import { loadPdfDocument } from "@/lib/pdfUtils";
import type { ProcessingResult, ProcessingStage } from "@/lib/ruleEngine/types";
import { exportDocument } from "@/lib/ruleEngine/exportAdapters";
import ExportOptionsDialog from "@/components/ExportOptionsDialog";
import { useToast } from "@/hooks/use-toast";
import { useUsageContext } from "@/contexts/UsageContext";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  stage?: string;
  result?: ProcessingResult;
  file?: File;
}

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const processingRef = useRef<Map<string, boolean>>(new Map());
  
  // Get usage context for plan-aware exports
  const { plan, isAuthenticated, canProcess, allowedFormats, refreshUsage } = useUsageContext();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ["application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      return "Only PDF files are accepted";
    }
    if (file.size > maxSize) {
      return "File size must be under 50MB";
    }
    return null;
  };

  const getStageMessage = (stage: ProcessingStage): string => {
    switch (stage.stage) {
      case 'upload': return 'Loading PDF...';
      case 'extract': return stage.message || 'Extracting text...';
      case 'anchor': return 'Detecting columns...';
      case 'stitch': return 'Processing transactions...';
      case 'validate': return 'Validating balances...';
      case 'output': return 'Finalizing...';
      default: return 'Processing...';
    }
  };

  const processFile = useCallback(async (file: File, fileId: string) => {
    // Prevent duplicate processing
    if (processingRef.current.get(fileId)) return;
    processingRef.current.set(fileId, true);

    try {
      // Update to checking quota status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "uploading" as const, progress: 0, stage: "Checking quota..." }
            : f
        )
      );

      // CRITICAL: Get page count FIRST before processing
      const { document: pdfDoc, totalPages } = await loadPdfDocument(file);
      
      // CRITICAL: Check and decrement quota BEFORE processing begins
      const { data: usageResult, error: usageError } = await supabase.functions.invoke('track-usage', {
        body: { pages: totalPages }
      });

      if (usageError || !usageResult?.success) {
        const errorMessage = usageResult?.error || usageError?.message || 'Quota check failed';
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "error" as const, error: errorMessage }
              : f
          )
        );
        toast({
          variant: "destructive",
          title: "Page limit reached",
          description: usageResult?.quotaExceeded 
            ? `You have ${usageResult.remaining} page(s) remaining. This file has ${totalPages} pages.`
            : errorMessage,
        });
        // Refresh usage to update UI
        refreshUsage();
        return;
      }

      // Update to processing status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "processing" as const, progress: 5, stage: "Loading PDF..." }
            : f
        )
      );

      const result = await processPDF(file, {
        onProgress: (stage: ProcessingStage) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    progress: Math.min(stage.progress || 0, 95),
                    stage: getStageMessage(stage),
                  }
                : f
            )
          );
        },
      });

      if (result.success && result.document) {
        // Check if there are validation errors
        const hasErrors = result.document.errorTransactions > 0;
        const hasWarnings = result.document.warningTransactions > 0;
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "complete" as const,
                  progress: 100,
                  stage: hasErrors 
                    ? `${result.document?.totalTransactions || 0} transactions (${result.document?.errorTransactions} errors)`
                    : hasWarnings
                      ? `${result.document?.totalTransactions || 0} transactions (${result.document?.warningTransactions} warnings)`
                      : `${result.document?.totalTransactions || 0} transactions extracted`,
                  result,
                }
              : f
          )
        );
        
        // Show appropriate toast
        if (hasErrors) {
          toast({
            variant: "destructive",
            title: "Validation errors detected",
            description: `${result.document.errorTransactions} transaction(s) failed balance validation. Export is blocked until resolved.`,
          });
        } else if (hasWarnings) {
          toast({
            title: "Processing complete with warnings",
            description: `Extracted ${result.document.totalTransactions} transactions. ${result.document.warningTransactions} have balance warnings.`,
          });
        } else {
          toast({
            title: "Processing complete",
            description: `Extracted ${result.document.totalTransactions} transactions from ${file.name}`,
          });
        }
        
        // Refresh usage to reflect new quota
        refreshUsage();
      } else {
        const errorMessage = result.errors?.[0]?.message || "Failed to process PDF";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "error" as const, error: errorMessage } : f
          )
        );
        toast({
          variant: "destructive",
          title: "Processing failed",
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "error" as const, error: errorMessage } : f
        )
      );
      toast({
        variant: "destructive",
        title: "Processing error",
        description: errorMessage,
      });
    } finally {
      processingRef.current.delete(fileId);
    }
  }, [toast, refreshUsage]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    // Check if user can process before accepting files
    if (!canProcess) {
      toast({
        variant: "destructive",
        title: "Page limit reached",
        description: "You've used all your pages for today. Upgrade for more capacity.",
      });
      return;
    }

    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file, index) => {
      const error = validateFile(file);
      const id = `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

      const uploadedFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        progress: 0,
        status: error ? "error" : "uploading",
        error: error || undefined,
        file: error ? undefined : file,
      };

      newFiles.push(uploadedFile);
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Process valid files
    newFiles.forEach((newFile) => {
      if (newFile.file && !newFile.error) {
        setTimeout(() => processFile(newFile.file!, newFile.id), 100);
      }
    });
  }, [processFile, canProcess, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        // Reset input to allow re-selecting the same file
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleExport = useCallback(
    async (file: UploadedFile, exportType: "masked" | "full", format: "csv" | "xlsx") => {
      if (!file.result?.document) return;

      try {
        // Check for validation errors before allowing export
        if (file.result.document.errorTransactions > 0) {
          toast({
            variant: "destructive",
            title: "Export blocked",
            description: `${file.result.document.errorTransactions} transaction(s) have balance errors. Fix validation issues before exporting.`,
          });
          return;
        }

        // Export the document data
        const exportedData = exportDocument(file.result.document, "standard");

        // Get all transactions with validation status
        const allTransactions = file.result.document.segments.flatMap(s => s.transactions);

        // Prepare transactions for backend with validation status
        const transactions = exportedData.rows.map((row, index) => ({
          date: String(row[0] || ""),
          description: String(row[1] || ""),
          debit: String(row[2] || ""),
          credit: String(row[3] || ""),
          balance: String(row[4] || ""),
          validationStatus: allTransactions[index]?.validationStatus || 'unchecked',
        }));

        // Call backend to generate export (enforces authentication and plan checks)
        const { data, error } = await supabase.functions.invoke('generate-export', {
          body: {
            transactions,
            exportType,
            format,
            filename: file.name,
            pageCount: file.result.document.totalPages,
            timestamp: Date.now(), // Add timestamp for replay protection
          }
        });

        if (error) {
          console.error('Export error:', error);
          toast({
            variant: "destructive",
            title: "Export failed",
            description: error.message || "Failed to generate export",
          });
          return;
        }

        if (!data?.success) {
          // Handle specific error cases
          if (data?.validationFailed) {
            toast({
              variant: "destructive",
              title: "Export blocked",
              description: data.error || "Balance validation failed. Fix errors before exporting.",
            });
          } else if (data?.requiresAuth) {
            toast({
              variant: "destructive",
              title: "Authentication required",
              description: "Please sign in to download your data",
            });
          } else if (data?.upgradeRequired) {
            toast({
              variant: "destructive",
              title: "Upgrade required",
              description: data.error || "This feature requires a paid plan",
            });
          } else if (data?.quotaExceeded) {
            toast({
              variant: "destructive",
              title: "Quota exceeded",
              description: data.error || "You have reached your usage limit",
            });
          } else if (data?.expired) {
            toast({
              variant: "destructive",
              title: "Request expired",
              description: "Please try the export again",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Export failed",
              description: data?.error || "Failed to export file",
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
        if (data.message) {
          toast({
            title: "Download started",
            description: data.message,
          });
        } else if (format === "xlsx") {
          toast({
            title: "Downloaded as CSV",
            description: "Excel export coming soon. File saved as CSV.",
          });
        } else {
          toast({
            title: "Download started",
            description: `${data.filename} is being downloaded`,
          });
        }
      } catch (error) {
        console.error('Export error:', error);
        toast({
          variant: "destructive",
          title: "Export failed",
          description: error instanceof Error ? error.message : "Failed to export file",
        });
      }
    },
    [toast]
  );

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return file.stage || "Preparing...";
      case "processing":
        return file.stage || "Processing...";
      case "complete":
        return file.stage || "Ready to export";
      case "error":
        return file.error;
    }
  };

  // Check if export should be disabled due to validation errors
  const hasValidationErrors = (file: UploadedFile): boolean => {
    return (file.result?.document?.errorTransactions ?? 0) > 0;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
          "bg-card/50 backdrop-blur-sm hover:bg-card/70",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border/50 hover:border-primary/50",
          !canProcess && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={!canProcess}
        />

        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
            isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"
          )}
        >
          <Upload
            className={cn(
              "w-8 h-8 transition-all duration-300",
              isDragging ? "text-primary scale-110" : "text-primary/70"
            )}
          />
        </div>

        <p className="text-lg font-medium text-foreground mb-1">
          {!canProcess 
            ? "Page limit reached" 
            : isDragging 
              ? "Drop your files here" 
              : "Drag & drop bank statements"}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {!canProcess ? "Upgrade for more pages" : "or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground/70">
          PDF files only • Max 50MB per file
        </p>
      </label>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "glass-card p-4 rounded-xl transition-all duration-300",
                file.status === "error" && "border-destructive/50",
                hasValidationErrors(file) && file.status === "complete" && "border-orange-500/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    file.status === "error" 
                      ? "bg-destructive/10" 
                      : hasValidationErrors(file) && file.status === "complete"
                        ? "bg-orange-500/10"
                        : "bg-primary/10"
                  )}
                >
                  <FileText
                    className={cn(
                      "w-5 h-5",
                      file.status === "error" 
                        ? "text-destructive" 
                        : hasValidationErrors(file) && file.status === "complete"
                          ? "text-orange-500"
                          : "text-primary"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span
                      className={cn(
                        "text-xs flex items-center gap-1",
                        file.status === "complete" && !hasValidationErrors(file)
                          ? "text-emerald-400"
                          : file.status === "complete" && hasValidationErrors(file)
                            ? "text-orange-500"
                            : file.status === "error"
                              ? "text-destructive"
                              : "text-muted-foreground"
                      )}
                    >
                      {file.status === "complete" && hasValidationErrors(file) 
                        ? <AlertCircle className="w-4 h-4 text-orange-500" />
                        : getStatusIcon(file.status)}
                      {getStatusText(file)}
                    </span>
                  </div>

                  {(file.status === "uploading" || file.status === "processing") && (
                    <div className="mt-2">
                      <Progress
                        value={file.progress}
                        className={cn("h-1.5", file.status === "processing" && "animate-pulse")}
                      />
                    </div>
                  )}

                  {/* Validation error message */}
                  {file.status === "complete" && hasValidationErrors(file) && (
                    <p className="text-xs text-orange-500 mt-2">
                      ⚠️ Export blocked: Fix {file.result?.document?.errorTransactions} balance error(s) before downloading
                    </p>
                  )}

                  {/* Export Button - Show when complete */}
                  {file.status === "complete" && file.result?.document && (
                    <div className="mt-3">
                      <ExportOptionsDialog
                        filename={file.name.replace(".pdf", "")}
                        onExport={(type, format) => handleExport(file, type, format)}
                        piiMaskingLevel={plan?.piiMasking || 'none'}
                        isAuthenticated={isAuthenticated}
                        planName={plan?.displayName}
                        allowedFormats={allowedFormats}
                        disabled={!canProcess || hasValidationErrors(file)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;