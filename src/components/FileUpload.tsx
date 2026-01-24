import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { processPDF } from "@/lib/pdfProcessor";
import type { ProcessingResult, ProcessingStage } from "@/lib/ruleEngine/types";
import { exportDocument } from "@/lib/ruleEngine/exportAdapters";
import { maskTransactionData, resetMaskingState, generateExportFilename } from "@/lib/piiMasker";
import ExportOptionsDialog from "@/components/ExportOptionsDialog";
import { useToast } from "@/hooks/use-toast";

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
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "complete" as const,
                  progress: 100,
                  stage: `${result.document?.totalTransactions || 0} transactions extracted`,
                  result,
                }
              : f
          )
        );
        toast({
          title: "Processing complete",
          description: `Extracted ${result.document.totalTransactions} transactions from ${file.name}`,
        });
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
  }, [toast]);

  const handleFiles = useCallback((fileList: FileList) => {
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
  }, [processFile]);

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
    (file: UploadedFile, exportType: "masked" | "full", format: "csv" | "xlsx") => {
      if (!file.result?.document) return;

      try {
        // Export the document data
        const exportedData = exportDocument(file.result.document, "standard");

        // Apply masking if needed
        let dataRows = exportedData.rows;
        if (exportType === "masked") {
          resetMaskingState();
          // Convert rows to transaction format for masking
          const transactions = dataRows.map((row) => ({
            date: String(row[0] || ""),
            description: String(row[1] || ""),
            debit: String(row[2] || ""),
            credit: String(row[3] || ""),
            balance: String(row[4] || ""),
          }));
          const maskedTransactions = maskTransactionData(transactions);
          dataRows = maskedTransactions.map((t) => [
            t.date,
            t.description,
            t.debit,
            t.credit,
            t.balance,
          ]);
        }

        // Generate filename
        const filename = generateExportFilename(file.name, exportType === "masked", format);

        // Create CSV content
        const csvContent = [
          exportedData.headers.join(","),
          ...dataRows.map((row) =>
            row
              .map((cell) => {
                const str = String(cell);
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                  return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
              })
              .join(",")
          ),
        ].join("\n");

        // Create and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = format === "xlsx" ? filename.replace(".xlsx", ".csv") : filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (format === "xlsx") {
          toast({
            title: "Downloaded as CSV",
            description: "Excel export coming soon. File saved as CSV.",
          });
        } else {
          toast({
            title: "Download started",
            description: `${filename} is being downloaded`,
          });
        }
      } catch (error) {
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
        return "Preparing...";
      case "processing":
        return file.stage || "Processing...";
      case "complete":
        return file.stage || "Ready to export";
      case "error":
        return file.error;
    }
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
            : "border-border/50 hover:border-primary/50"
        )}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
          {isDragging ? "Drop your files here" : "Drag & drop bank statements"}
        </p>
        <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
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
                file.status === "error" && "border-destructive/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    file.status === "error" ? "bg-destructive/10" : "bg-primary/10"
                  )}
                >
                  <FileText
                    className={cn(
                      "w-5 h-5",
                      file.status === "error" ? "text-destructive" : "text-primary"
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
                        file.status === "complete"
                          ? "text-emerald-400"
                          : file.status === "error"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {getStatusIcon(file.status)}
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

                  {/* Export Button - Show when complete */}
                  {file.status === "complete" && file.result?.document && (
                    <div className="mt-3">
                      <ExportOptionsDialog
                        filename={file.name.replace(".pdf", "")}
                        onExport={(type, format) => handleExport(file, type, format)}
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
