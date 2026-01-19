import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
}

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

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

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "processing" } : f
          )
        );
        // Simulate processing
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "complete" } : f
            )
          );
        }, 1500);
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 200);
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const uploadedFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        progress: error ? 0 : 0,
        status: error ? "error" : "uploading",
        error: error || undefined,
      };

      newFiles.push(uploadedFile);

      if (!error) {
        setTimeout(() => simulateUpload(id), 100);
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

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
      }
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return `Uploading... ${Math.round(file.progress)}%`;
      case "processing":
        return "Processing...";
      case "complete":
        return "Ready to download";
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
            isDragging
              ? "bg-primary/20 scale-110"
              : "bg-primary/10"
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
        <p className="text-sm text-muted-foreground mb-3">
          or click to browse
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
                file.status === "error" && "border-destructive/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    file.status === "error"
                      ? "bg-destructive/10"
                      : "bg-primary/10"
                  )}
                >
                  <FileText
                    className={cn(
                      "w-5 h-5",
                      file.status === "error"
                        ? "text-destructive"
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

                  {(file.status === "uploading" ||
                    file.status === "processing") && (
                    <div className="mt-2">
                      <Progress
                        value={file.status === "processing" ? 100 : file.progress}
                        className={cn(
                          "h-1.5",
                          file.status === "processing" && "animate-pulse"
                        )}
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
