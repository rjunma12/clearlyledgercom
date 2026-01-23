/**
 * BatchFileUpload - Premium multi-file upload component for Pro/Business tiers
 */

import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Files,
  Crown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUsage } from '@/hooks/use-usage';
import { validateBatchFiles, BatchFileStatus } from '@/lib/batchPdfProcessor';
import { cn } from '@/lib/utils';

interface BatchFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onProcessBatch: () => void;
  isProcessing: boolean;
  fileStatuses: BatchFileStatus[];
  maxFiles?: number;
  className?: string;
}

const BatchFileUpload = ({
  onFilesSelected,
  onProcessBatch,
  isProcessing,
  fileStatuses,
  maxFiles: maxFilesProp,
  className,
}: BatchFileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { plan, canBatchUpload, maxBatchFiles, isAuthenticated } = useUsage();
  
  const effectiveMaxFiles = maxFilesProp ?? maxBatchFiles;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Validate files
    const validation = validateBatchFiles(fileArray, effectiveMaxFiles);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setFiles(fileArray);
    onFilesSelected(fileArray);
  }, [effectiveMaxFiles, onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!canBatchUpload) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    setValidationErrors([]);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesSelected([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: BatchFileStatus['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const hasFiles = files.length > 0;

  // Upgrade prompt for non-premium users
  if (!canBatchUpload) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Batch Upload is a Premium Feature</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Upload and merge multiple bank statements into one consolidated file. 
              Available on Professional and Business plans.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="gap-1">
              <Files className="w-3 h-3" /> Up to 20 files
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" /> Merged output
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="w-3 h-3" /> Source tracking
            </Badge>
          </div>
          <Button variant="glow" className="gap-2" asChild>
            <a href="/pricing">
              Upgrade Now <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Files className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Batch Upload</h3>
          <Badge variant="secondary" className="text-xs">
            {plan?.displayName}
          </Badge>
        </div>
        {hasFiles && !isProcessing && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      {/* Drop Zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
          isDragging 
            ? "bg-primary/20 scale-110" 
            : "bg-muted"
        )}>
          <Upload className={cn(
            "w-8 h-8 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <p className="text-foreground font-medium mb-1">
          {isDragging ? "Drop files here" : "Drag & drop multiple PDFs"}
        </p>
        <p className="text-muted-foreground text-sm">
          or click to browse • Up to {effectiveMaxFiles} files • 50MB each
        </p>
      </label>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive mb-1">Validation Error</p>
              <ul className="text-sm text-destructive/80 space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
            <span>{formatFileSize(totalSize)} total</span>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {files.map((file, index) => {
              const status = fileStatuses[index];
              const isComplete = status?.status === 'complete';
              const hasError = status?.status === 'error';
              const isFileProcessing = status?.status === 'processing';
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    hasError 
                      ? "bg-destructive/5 border-destructive/30" 
                      : isComplete 
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/50 border-border"
                  )}
                >
                  {status ? getStatusIcon(status.status) : <FileText className="w-4 h-4 text-muted-foreground" />}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {status?.pageCount !== undefined && (
                        <>
                          <span>•</span>
                          <span>{status.pageCount} pages</span>
                        </>
                      )}
                      {status?.transactionCount !== undefined && (
                        <>
                          <span>•</span>
                          <span>{status.transactionCount} transactions</span>
                        </>
                      )}
                      {hasError && status?.error && (
                        <>
                          <span>•</span>
                          <span className="text-destructive">{status.error}</span>
                        </>
                      )}
                    </div>
                    
                    {isFileProcessing && status?.progress !== undefined && (
                      <Progress value={status.progress} className="h-1 mt-2" />
                    )}
                  </div>
                  
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Process Button */}
          <Button
            onClick={onProcessBatch}
            disabled={isProcessing || files.length === 0}
            variant="glow"
            size="lg"
            className="w-full gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Process & Merge {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BatchFileUpload;
