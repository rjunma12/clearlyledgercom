import { useState } from "react";
import { Download, Shield, AlertTriangle, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type ExportType = 'masked' | 'full';
export type ExportFormat = 'xlsx' | 'csv';

interface ExportOptionsDialogProps {
  onExport: (type: ExportType, format: ExportFormat) => void;
  filename?: string;
  disabled?: boolean;
  triggerClassName?: string;
}

const ExportOptionsDialog = ({
  onExport,
  filename = "statement",
  disabled = false,
  triggerClassName,
}: ExportOptionsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('masked');
  const [fullDataConfirmed, setFullDataConfirmed] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  const handleExport = () => {
    onExport(exportType, exportFormat);
    setOpen(false);
    // Reset state for next export
    setExportType('masked');
    setFullDataConfirmed(false);
  };

  const canExport = exportType === 'masked' || (exportType === 'full' && fullDataConfirmed);

  const getExportFilename = () => {
    const suffix = exportType === 'masked' ? '_anonymized' : '_full';
    return `${filename}${suffix}.${exportFormat}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className={`gap-2 text-primary ${triggerClassName || ''}`}
          disabled={disabled}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Options
          </DialogTitle>
          <DialogDescription>
            Choose how you want to export your data. Masked files are safe to share with third parties.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Privacy Level</Label>
            
            {/* Masked Option */}
            <div
              onClick={() => {
                setExportType('masked');
                setFullDataConfirmed(false);
              }}
              className={`
                relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${exportType === 'masked' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${exportType === 'masked' ? 'bg-primary/20' : 'bg-muted'}
              `}>
                <Shield className={`w-5 h-5 ${exportType === 'masked' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Masked / Anonymized</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  PII protected — Names, emails, phone numbers, and account numbers are anonymized. Safe to share.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                    <Lock className="w-3 h-3 inline mr-1" />Names → Person_001
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                    Emails → ***@domain.com
                  </span>
                </div>
              </div>
              {exportType === 'masked' && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Full Data Option */}
            <div
              onClick={() => setExportType('full')}
              className={`
                relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${exportType === 'full' 
                  ? 'border-amber-500 bg-amber-500/5' 
                  : 'border-border hover:border-amber-500/50 hover:bg-muted/50'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${exportType === 'full' ? 'bg-amber-500/20' : 'bg-muted'}
              `}>
                <Unlock className={`w-5 h-5 ${exportType === 'full' ? 'text-amber-500' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Full Data</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Includes all sensitive PII — Original names, full account numbers, and personal details are preserved.
                </p>
              </div>
              {exportType === 'full' && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Full Data Confirmation */}
            {exportType === 'full' && (
              <div className="animate-fade-in p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Full data exports contain sensitive personal information. Only use this option when you need the complete original data.
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="confirm-full-data"
                        checked={fullDataConfirmed}
                        onCheckedChange={(checked) => setFullDataConfirmed(checked === true)}
                      />
                      <Label 
                        htmlFor="confirm-full-data" 
                        className="text-sm font-medium cursor-pointer text-foreground"
                      >
                        I understand this file contains sensitive PII
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">File Format</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setExportFormat('csv')}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all
                  ${exportFormat === 'csv' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border text-muted-foreground hover:border-primary/50'
                  }
                `}
              >
                CSV
              </button>
              <button
                onClick={() => setExportFormat('xlsx')}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all
                  ${exportFormat === 'xlsx' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border text-muted-foreground hover:border-primary/50'
                  }
                `}
              >
                Excel (XLSX)
              </button>
            </div>
          </div>

          {/* Filename Preview */}
          <div className="pt-2">
            <Label className="text-sm font-medium text-muted-foreground">Output filename</Label>
            <div className="mt-1 px-3 py-2 rounded-md bg-muted/50 border border-border text-sm font-mono">
              {getExportFilename()}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={!canExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export {exportType === 'masked' ? 'Masked' : 'Full'} Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportOptionsDialog;
