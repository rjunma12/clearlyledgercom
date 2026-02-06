import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { processPDF } from '@/lib/pdfProcessor';
import type { ProcessingResult } from '@/lib/ruleEngine/types';
import { Loader2 } from 'lucide-react';

interface TimingMetrics {
  totalTime: number;
  stages: Record<string, number>;
}

interface QualityMetrics {
  pdfType: string;
  totalPages: number;
  totalTransactions: number;
  totalErrors: number;
  totalWarnings: number;
  balanceValid: boolean;
  averageConfidence: number;
  hasScannedPages: boolean;
}

export default function TestConversion() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [timingMetrics, setTimingMetrics] = useState<TimingMetrics | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
      setTimingMetrics(null);
      setQualityMetrics(null);
    }
  };

  const handleProcessing = async () => {
    if (!file) return;

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      const result = await processPDF(file, {
        maxPages: 0, // No limit
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Extract timing metrics from stages
      const stages: Record<string, number> = {};
      result.stages.forEach((stage) => {
        if (stage.stage && stage.progress) {
          stages[stage.stage] = stage.progress;
        }
      });

      setTimingMetrics({
        totalTime,
        stages,
      });

      // Calculate quality metrics
      const qualityMetrics: QualityMetrics = {
        pdfType: (result.document as any)?.pdfType || 'UNKNOWN',
        totalPages: result.document?.totalPages || 0,
        totalTransactions: result.document?.totalTransactions || 0,
        totalErrors: result.errors?.length || 0,
        totalWarnings: result.warnings?.length || 0,
        balanceValid: result.document?.validationStatus === 'valid',
        averageConfidence: result.document?.averageConfidence || 0,
        hasScannedPages: result.warnings?.some(w => w.includes('OCR')) || false,
      };

      setQualityMetrics(qualityMetrics);
      setResult(result);

      // Log to console for debugging
      console.log('=== PDF PROCESSING RESULTS ===');
      console.log('Total Time:', totalTime.toFixed(2), 'ms');
      console.log('Result:', result);
      console.log('Quality Metrics:', qualityMetrics);
    } catch (error) {
      console.error('Error processing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PDF Conversion Test Lab</h1>
          <p className="text-muted-foreground">No page limits • Detailed timing metrics • Quality analysis</p>
        </div>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 1: Upload PDF</CardTitle>
            <CardDescription>Select a bank statement PDF to test (no limits)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1 px-4 py-2 border border-input rounded-md"
              />
              <Button
                onClick={handleProcessing}
                disabled={!file || isProcessing}
                className="gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Process'}
              </Button>
            </div>
            {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
          </CardContent>
        </Card>

        {/* Timing Results */}
        {timingMetrics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>⏱️ Timing Metrics</CardTitle>
              <CardDescription>Performance breakdown by processing stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Processing Time</p>
                  <p className="text-3xl font-bold text-primary">{timingMetrics.totalTime.toFixed(2)}ms</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Stage Breakdown:</h4>
                  {Object.entries(timingMetrics.stages).map(([stage, progress]) => (
                    <div key={stage} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{stage}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quality Metrics */}
        {qualityMetrics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>✓ Quality Analysis</CardTitle>
              <CardDescription>Document parsing quality and accuracy metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">PDF Type</p>
                  <p className="text-lg font-semibold">{qualityMetrics.pdfType}</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Pages</p>
                  <p className="text-lg font-semibold">{qualityMetrics.totalPages}</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Transactions Extracted</p>
                  <p className="text-lg font-semibold">{qualityMetrics.totalTransactions}</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Average Confidence</p>
                  <p className="text-lg font-semibold">{(qualityMetrics.averageConfidence * 100).toFixed(1)}%</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Balance Valid</p>
                  <p className={`text-lg font-semibold ${qualityMetrics.balanceValid ? 'text-green-600' : 'text-red-600'}`}>
                    {qualityMetrics.balanceValid ? 'YES' : 'NO'}
                  </p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Scanned (OCR)</p>
                  <p className={`text-lg font-semibold ${qualityMetrics.hasScannedPages ? 'text-amber-600' : 'text-green-600'}`}>
                    {qualityMetrics.hasScannedPages ? 'YES' : 'NO'}
                  </p>
                </div>
              </div>

              {qualityMetrics.totalErrors > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">⚠️ Errors: {qualityMetrics.totalErrors}</p>
                </div>
              )}

              {qualityMetrics.totalWarnings > 0 && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">ℹ️ Warnings: {qualityMetrics.totalWarnings}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Raw Data */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Full Processing Result</CardTitle>
              <CardDescription>Raw JSON data for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-lg overflow-auto text-xs max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
