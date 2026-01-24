import { useState } from "react";
import { Download, Shield, AlertTriangle, Lock, Unlock, LogIn, Sparkles, FileSpreadsheet } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

export type ExportType = 'masked' | 'full';
export type ExportFormat = 'xlsx' | 'csv';
export type PiiMaskingLevel = 'none' | 'optional' | 'enforced';

interface ExportOptionsDialogProps {
  onExport: (type: ExportType, format: ExportFormat) => void;
  filename?: string;
  disabled?: boolean;
  triggerClassName?: string;
  /** User's PII masking level from their plan */
  piiMaskingLevel?: PiiMaskingLevel;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Plan display name for messaging */
  planName?: string;
  /** Allowed export formats for this plan */
  allowedFormats?: ExportFormat[];
}

const ExportOptionsDialog = ({
  onExport,
  filename = "statement",
  disabled = false,
  triggerClassName,
  piiMaskingLevel = 'optional',
  isAuthenticated = true,
  planName,
  allowedFormats = ['csv', 'xlsx'],
}: ExportOptionsDialogProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('masked');
  const [fullDataConfirmed, setFullDataConfirmed] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');

  // Determine what options are available based on plan
  const canAccessFullData = piiMaskingLevel === 'optional';
  const isEnforcedMasking = piiMaskingLevel === 'enforced';
  const isFreePlan = piiMaskingLevel === 'none';
  const isAnonymous = !isAuthenticated;
  
  // Format restrictions
  const canUseCsv = allowedFormats.includes('csv');
  const canUseXlsx = allowedFormats.includes('xlsx');

  const handleExport = () => {
    // For enforced masking plans, always export masked
    const finalExportType = isEnforcedMasking ? 'masked' : exportType;
    onExport(finalExportType, exportFormat);
    setOpen(false);
    // Reset state for next export
    setExportType('masked');
    setFullDataConfirmed(false);
  };

  const handleUpgradeClick = () => {
    setOpen(false);
    // Navigate to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#pricing');
    }
  };

  const handleLoginClick = () => {
    setOpen(false);
    navigate('/login');
  };

  const canExport = exportType === 'masked' || (exportType === 'full' && fullDataConfirmed && canAccessFullData);

  const getExportFilename = () => {
    const actualType = isEnforcedMasking ? 'masked' : exportType;
    const suffix = actualType === 'masked' ? '_anonymized' : '_full';
    // Currently only CSV is supported from backend
    return `${filename}${suffix}.csv`;
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
            {isAnonymous
              ? "Sign in to download your processed data."
              : isFreePlan
                ? "Your free plan includes masked Excel exports. Upgrade for more options."
                : "Choose how you want to export your data. Masked files are safe to share with third parties."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Unauthenticated State - ANONYMOUS USERS */}
        {isAnonymous && (
          <div className="py-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Sign in Required</h3>
                <p className="text-sm text-muted-foreground">
                  Create a free account to download your converted data. Free users get masked Excel exports.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleLoginClick}>
                  Sign In
                </Button>
                <Button variant="glow" onClick={() => { setOpen(false); navigate('/signup'); }}>
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated but Free Plan - Show disabled PII toggle with tooltip */}
        {isAuthenticated && isFreePlan && (
          <div className="space-y-4 py-4">
            {/* Privacy Level - PII toggle visible but disabled */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Privacy Level</Label>
              
              {/* Masked Option - Selected by default, only option */}
              <div className="relative flex items-start gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Masked / Anonymized</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      Included
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    PII protected — Names, emails, phone numbers, and account numbers are anonymized.
                  </p>
                </div>
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Full Data Option - Disabled with tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex items-start gap-4 p-4 rounded-lg border-2 border-border opacity-50 cursor-not-allowed">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                        <Unlock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Full Data</span>
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Includes all original PII data
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium">PII masking starts from Starter plan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upgrade to access unmasked data exports with full names, account numbers, and personal details.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Upgrade Prompt */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Want full data access & CSV exports?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upgrade to Starter or higher to export complete transaction data with CSV format.
                    </p>
                    <Button size="sm" variant="outline" onClick={handleUpgradeClick} className="mt-2">
                      View Plans
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Format Selection - Only Excel for free users */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">File Format</Label>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 px-4 rounded-lg border-2 border-primary bg-primary/5 text-primary font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                  Excel (XLSX)
                </button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="flex-1 py-2.5 px-4 rounded-lg border-2 border-border text-muted-foreground font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                        disabled
                      >
                        CSV
                        <Lock className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>CSV export requires a paid plan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Filename Preview */}
            <div className="pt-2">
              <Label className="text-sm font-medium text-muted-foreground">Output filename</Label>
              <div className="mt-1 px-3 py-2 rounded-md bg-muted/50 border border-border text-sm font-mono">
                {filename}_anonymized.csv
              </div>
            </div>
          </div>
        )}

        {/* Authenticated with Paid Plan */}
        {isAuthenticated && !isFreePlan && (
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
                      {isEnforcedMasking ? 'Required' : 'Recommended'}
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

              {/* Full Data Option - Only show if allowed */}
              {!isEnforcedMasking && (
                <div
                  onClick={() => canAccessFullData && setExportType('full')}
                  className={`
                    relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all
                    ${!canAccessFullData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
              )}

              {/* Enforced Masking Notice */}
              {isEnforcedMasking && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/30">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Privacy-First Export
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your {planName || 'plan'} automatically anonymizes all exports for enhanced compliance and data protection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Data Confirmation */}
              {exportType === 'full' && canAccessFullData && (
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
                {canUseCsv && (
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
                )}
                {canUseXlsx && (
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
                )}
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
        )}

        <DialogFooter>
          {isAuthenticated && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="glow"
                onClick={handleExport}
                disabled={!canExport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isFreePlan ? 'Export Masked Data' : `Export ${exportType === 'masked' ? 'Masked' : 'Full'} Data`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportOptionsDialog;
