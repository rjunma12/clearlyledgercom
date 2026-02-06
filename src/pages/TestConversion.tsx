import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { processPDF } from '@/lib/pdfProcessor';
import type { ProcessingResult, StatementMetadata, ValidationSummary, StandardizedTransaction } from '@/lib/ruleEngine/types';
import type { TableMetrics, ColumnBoundary } from '@/lib/ruleEngine/tableDetector';
import { Loader2, Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { TableMetricsPanel } from '@/components/test/TableMetricsPanel';
import { TransactionSummaryPanel } from '@/components/test/TransactionSummaryPanel';
import { ColumnVisualization } from '@/components/test/ColumnVisualization';
import { RawTransactionTable } from '@/components/test/RawTransactionTable';
import { ColumnConflictsPanel } from '@/components/test/ColumnConflictsPanel';
import { generateStandardizedExcel } from '@/lib/excelGenerator';

interface ExtendedResult extends ProcessingResult {
  perTableMetrics?: TableMetrics[];
  columnBoundaries?: ColumnBoundary[];
}

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
  validationStatus: string;
  errorTransactions: number;
  warningTransactions: number;
  hasScannedPages: boolean;
  confidence: number;
  tableRegions: number;
}

export default function TestConversion() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtendedResult | null>(null);
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
      }) as ExtendedResult;

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
        validationStatus: result.document?.overallValidation || 'unchecked',
        errorTransactions: result.document?.errorTransactions || 0,
        warningTransactions: result.document?.warningTransactions || 0,
        hasScannedPages: result.warnings?.some(w => w.includes('OCR')) || false,
        confidence: (result as any).confidence || 0,
        tableRegions: result.perTableMetrics?.length || 0,
      };

      setQualityMetrics(qualityMetrics);
      setResult(result);

      // Log to console for debugging
      console.log('=== PDF PROCESSING RESULTS ===');
      console.log('Total Time:', totalTime.toFixed(2), 'ms');
      console.log('Result:', result);
      console.log('Quality Metrics:', qualityMetrics);
      console.log('Per-Table Metrics:', result.perTableMetrics);
      console.log('Column Boundaries:', result.columnBoundaries);
    } catch (error) {
      console.error('Error processing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportDebugData = () => {
    if (!result) return;
    
    const debugData = {
      timingMetrics,
      qualityMetrics,
      perTableMetrics: result.perTableMetrics,
      columnBoundaries: result.columnBoundaries,
      document: result.document,
      errors: result.errors,
      warnings: result.warnings,
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${file?.name || 'result'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = async () => {
    if (!result || transactions.length === 0) return;

    try {
      // Determine confidence level
      const confScore = qualityMetrics?.confidence || 0;
      const confidenceLevel: 'High' | 'Medium' | 'Low' = 
        confScore >= 0.9 ? 'High' : confScore >= 0.7 ? 'Medium' : 'Low';

      // Determine PDF type
      const pdfType: 'Text' | 'Scanned' = 
        qualityMetrics?.pdfType === 'SCANNED' ? 'Scanned' : 'Text';

      // Extract header data from the correct path
      const extractedHeader = (result.document as any)?.extractedHeader;
      const detectedCurrency = extractedHeader?.currency || 'USD';

      // Build StatementMetadata from extractedHeader (correct path)
      const metadata: StatementMetadata = {
        bankName: extractedHeader?.bankName || 'Unknown Bank',
        accountHolder: extractedHeader?.accountHolder || '',
        accountNumberMasked: extractedHeader?.accountNumberMasked || '',
        statementPeriodFrom: extractedHeader?.statementPeriodFrom || '',
        statementPeriodTo: extractedHeader?.statementPeriodTo || '',
        openingBalance: result.document?.segments?.[0]?.openingBalance,
        closingBalance: result.document?.segments?.[result.document.segments.length - 1]?.closingBalance,
        currency: detectedCurrency,
        pagesProcessed: qualityMetrics?.totalPages || 0,
        pdfType,
        ocrUsed: qualityMetrics?.hasScannedPages || false,
        conversionTimestamp: new Date().toISOString(),
        conversionConfidence: confidenceLevel,
      };

      // Build ValidationSummary
      const validationSummary: ValidationSummary = {
        openingBalanceFound: !!result.document?.segments?.[0]?.openingBalance,
        closingBalanceFound: !!result.document?.segments?.[result.document.segments.length - 1]?.closingBalance,
        balanceCheckPassed: result.document?.overallValidation === 'valid',
        balanceDifference: undefined,
        rowsExtracted: transactions.length,
        rowsMerged: 0,
        autoRepairApplied: false,
        warnings: result.warnings || [],
        averageConfidence: qualityMetrics?.confidence ? Math.round(qualityMetrics.confidence * 100) : undefined,
        gradeDistribution: calculateGradeDistribution(transactions),
        lowConfidenceCount: transactions.filter(t => (t as any).confidenceScore < 50).length,
      };

      // Convert transactions to StandardizedTransaction format
      const standardizedTransactions: StandardizedTransaction[] = transactions.map(tx => ({
        date: tx.date || '',
        description: tx.description || '',
        debit: tx.debit != null ? String(tx.debit) : '',
        credit: tx.credit != null ? String(tx.credit) : '',
        balance: tx.balance != null ? String(tx.balance) : '',
        currency: detectedCurrency,
        reference: tx.reference || '',
        validationStatus: tx.validationStatus as 'valid' | 'warning' | 'error' | undefined,
      }));

      // Generate Excel
      const buffer = await generateStandardizedExcel({
        transactions: standardizedTransactions,
        metadata,
        validationSummary,
        filename: file?.name?.replace('.pdf', '.xlsx') || 'export.xlsx',
      });

      // Download
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file?.name?.replace('.pdf', '.xlsx') || 'export.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
  };

  function calculateGradeDistribution(txs: typeof transactions): string {
    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const tx of txs) {
      const grade = (tx as any).grade;
      if (grade && grades.hasOwnProperty(grade)) {
        grades[grade as keyof typeof grades]++;
      }
    }
    return Object.entries(grades)
      .filter(([_, count]) => count > 0)
      .map(([grade, count]) => `${grade}:${count}`)
      .join(', ') || 'N/A';
  }

  // Get transactions for summary - improved extraction logic
  const transactions = (() => {
    if (!result?.document) return [];
    
    // Try multiple paths and use whichever has more transactions
    const fromRaw = result.document.rawTransactions || [];
    const fromSegments = result.document.segments?.flatMap(s => s.transactions) || [];
    
    // Return whichever has more transactions, preferring raw if equal
    return fromRaw.length >= fromSegments.length ? fromRaw : fromSegments;
  })();

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
              <CardTitle className="flex items-center justify-between">
                <span>✓ Quality Analysis</span>
                <div className="flex gap-2">
                  {result && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleDownloadExcel} 
                      className="gap-2"
                      disabled={transactions.length === 0}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Download Excel {transactions.length > 0 ? `(${transactions.length})` : '(No Data)'}
                    </Button>
                  )}
                  {result && (
                    <Button variant="outline" size="sm" onClick={handleExportDebugData} className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Debug Data
                    </Button>
                  )}
                </div>
              </CardTitle>
              <CardDescription>Document parsing quality and accuracy metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                <div className={`p-4 rounded-lg ${qualityMetrics.confidence >= 0.75 ? 'bg-primary/10' : qualityMetrics.confidence >= 0.5 ? 'bg-accent/20' : 'bg-destructive/10'}`}>
                  <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
                  <p className="text-lg font-semibold">{(qualityMetrics.confidence * 100).toFixed(0)}%</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Table Regions</p>
                  <p className="text-lg font-semibold">{qualityMetrics.tableRegions}</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Validation Status</p>
                  <p className="text-lg font-semibold capitalize">{qualityMetrics.validationStatus}</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Error Transactions</p>
                  <p className="text-lg font-semibold">{qualityMetrics.errorTransactions}</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Scanned (OCR)</p>
                  <p className="text-lg font-semibold">{qualityMetrics.hasScannedPages ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {qualityMetrics.totalErrors > 0 && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-semibold text-destructive">⚠️ Processing Errors: {qualityMetrics.totalErrors}</p>
                </div>
              )}

              {qualityMetrics.totalWarnings > 0 && (
                <div className="mt-2 p-3 bg-accent/20 rounded-lg">
                  <p className="text-sm font-semibold">ℹ️ Warnings: {qualityMetrics.totalWarnings}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Extracted Header Info */}
        {result?.document && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📋 Extracted Header Info</CardTitle>
              <CardDescription>Statement metadata extracted from PDF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Bank Name', value: (result.document as any)?.extractedHeader?.bankName },
                  { label: 'Account Holder', value: (result.document as any)?.extractedHeader?.accountHolder },
                  { label: 'Account Number', value: (result.document as any)?.extractedHeader?.accountNumberMasked },
                  { label: 'Currency', value: (result.document as any)?.extractedHeader?.currency },
                  { label: 'Statement From', value: (result.document as any)?.extractedHeader?.statementPeriodFrom },
                  { label: 'Statement To', value: (result.document as any)?.extractedHeader?.statementPeriodTo },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${item.value ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className={`text-sm font-medium ${item.value ? '' : 'text-destructive'}`}>
                      {item.value || '❌ Not Found'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Column Visualization */}
        {result?.columnBoundaries && result.columnBoundaries.length > 0 && (
          <div className="mb-6">
            <ColumnVisualization boundaries={result.columnBoundaries} />
          </div>
        )}

        {/* Per-Table Metrics */}
        {result?.perTableMetrics && result.perTableMetrics.length > 0 && (
          <div className="mb-6">
            <TableMetricsPanel metrics={result.perTableMetrics} />
          </div>
        )}

        {/* Debit/Credit Summary */}
        {transactions.length > 0 && (
          <div className="mb-6">
            <TransactionSummaryPanel 
              transactions={transactions}
              openingBalance={result?.document?.segments?.[0]?.openingBalance}
              closingBalance={result?.document?.segments?.[result.document.segments.length - 1]?.closingBalance}
            />
          </div>
        )}

        {/* Column Conflicts Panel */}
        {result?.perTableMetrics && result.perTableMetrics.length > 0 && result?.columnBoundaries && (
          <div className="mb-6">
            <ColumnConflictsPanel 
              perTableMetrics={result.perTableMetrics}
              reconciledBoundaries={result.columnBoundaries}
            />
          </div>
        )}

        {/* Raw Transaction Preview Table */}
        {transactions.length > 0 && (
          <div className="mb-6">
            <RawTransactionTable transactions={transactions} />
          </div>
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
