import { FileText, FileCheck, AlertCircle, Clock, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { ProcessingHistoryItem } from "@/hooks/use-processing-history";

interface HistoryTableProps {
  items: ProcessingHistoryItem[];
  isLoading?: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HistoryTable({ items, isLoading }: HistoryTableProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-2">No processing history</h3>
        <p className="text-sm text-muted-foreground">
          Files you process will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">File</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Size</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Pages</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Transactions</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Export</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr 
                key={item.id} 
                className={cn(
                  "border-b border-border/50 hover:bg-muted/20 transition-colors",
                  item.validationErrors > 0 && "bg-warning/5"
                )}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate max-w-[200px]">
                      {item.fileName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">
                  {formatFileSize(item.fileSizeBytes)}
                </td>
                <td className="py-3 px-4 text-center text-sm text-foreground">
                  {item.pagesProcessed}
                </td>
                <td className="py-3 px-4 text-center text-sm text-muted-foreground hidden md:table-cell">
                  {item.transactionsExtracted ?? '—'}
                  {item.validationErrors > 0 && (
                    <span className="ml-1 text-warning text-xs">
                      ({item.validationErrors} errors)
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {item.exportType === 'masked' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      <ShieldCheck className="w-3 h-3" />
                      Masked
                    </span>
                  ) : item.exportType === 'full' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                      <Shield className="w-3 h-3" />
                      Full
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {item.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-primary text-xs">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Completed</span>
                    </span>
                  ) : item.status === 'processing' ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span className="hidden sm:inline">Processing</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-destructive text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Failed</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right text-xs text-muted-foreground hidden lg:table-cell">
                  {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
