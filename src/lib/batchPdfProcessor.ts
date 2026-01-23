/**
 * Batch PDF Processor - Handles processing multiple PDFs and merging results
 * Premium feature for Professional and Business tiers
 */

import { processPDF, PDFProcessingOptions } from './pdfProcessor';
import { mergeDocuments, MergeOptions, MergeResult, DEFAULT_MERGE_OPTIONS } from './ruleEngine/documentMerger';
import { ParsedDocument, ProcessingResult } from './ruleEngine/types';

export interface BatchProcessingOptions extends Partial<PDFProcessingOptions> {
  mergeOptions?: Partial<MergeOptions>;
  onFileProgress?: (fileIndex: number, fileName: string, progress: number, stage: string) => void;
  onFileComplete?: (fileIndex: number, fileName: string, result: ProcessingResult) => void;
  onFileError?: (fileIndex: number, fileName: string, error: Error) => void;
}

export interface BatchFileStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  pageCount?: number;
  transactionCount?: number;
  error?: string;
  processingTime?: number;
}

export interface BatchProcessingResult {
  success: boolean;
  mergedDocument: ParsedDocument | null;
  mergeResult: MergeResult | null;
  individualResults: ProcessingResult[];
  fileStatuses: BatchFileStatus[];
  totalPages: number;
  totalTransactions: number;
  totalProcessingTime: number;
  errors: string[];
  warnings: string[];
}

/**
 * Process multiple PDF files and merge their results into a single document
 */
export async function processBatchPDFs(
  files: File[],
  options: BatchProcessingOptions = {}
): Promise<BatchProcessingResult> {
  const startTime = performance.now();
  const results: ProcessingResult[] = [];
  const fileStatuses: BatchFileStatus[] = files.map(file => ({
    fileName: file.name,
    status: 'pending' as const,
    progress: 0,
  }));
  const errors: string[] = [];
  const warnings: string[] = [];

  // Process each file sequentially to manage memory
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileStartTime = performance.now();
    
    fileStatuses[i].status = 'processing';
    options.onFileProgress?.(i, file.name, 0, 'Starting...');

    try {
      // Create file-specific progress handler
      const fileOptions: PDFProcessingOptions = {
        ...options,
        onProgress: (stage) => {
          const stageProgress = getStageProgress(stage.stage);
          fileStatuses[i].progress = stageProgress;
          options.onFileProgress?.(i, file.name, stageProgress, stage.stage);
        },
      };

      const result = await processPDF(file, fileOptions);
      
      fileStatuses[i].status = 'complete';
      fileStatuses[i].progress = 100;
      fileStatuses[i].pageCount = result.document?.totalPages || 0;
      fileStatuses[i].transactionCount = result.document?.totalTransactions || 0;
      fileStatuses[i].processingTime = performance.now() - fileStartTime;

      results.push(result);
      
      // Collect warnings
      if (result.warnings) {
        result.warnings.forEach(w => warnings.push(`${file.name}: ${w}`));
      }

      options.onFileComplete?.(i, file.name, result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      fileStatuses[i].status = 'error';
      fileStatuses[i].error = errorMessage;
      fileStatuses[i].processingTime = performance.now() - fileStartTime;
      
      errors.push(`${file.name}: ${errorMessage}`);
      options.onFileError?.(i, file.name, error instanceof Error ? error : new Error(errorMessage));

      // Add a failed result placeholder
      results.push({
        success: false,
        errors: [{ code: 'PROCESSING_FAILED', message: errorMessage, recoverable: false }],
        warnings: [],
        stages: [],
        totalDuration: performance.now() - fileStartTime,
      });
    }
  }

  // Check if any files were successfully processed
  const successfulResults = results.filter(r => r.success && r.document);
  
  if (successfulResults.length === 0) {
    return {
      success: false,
      mergedDocument: null,
      mergeResult: null,
      individualResults: results,
      fileStatuses,
      totalPages: 0,
      totalTransactions: 0,
      totalProcessingTime: performance.now() - startTime,
      errors: errors.length > 0 ? errors : ['No files were successfully processed'],
      warnings,
    };
  }

  // Merge successful documents
  const documentsToMerge = successfulResults.map(r => r.document!);
  const fileNames = files
    .filter((_, i) => results[i].success && results[i].document)
    .map(f => f.name);

  const mergeResult = mergeDocuments(
    documentsToMerge,
    fileNames,
    options.mergeOptions || DEFAULT_MERGE_OPTIONS
  );

  // Add merge warnings
  mergeResult.warnings.forEach(w => warnings.push(w));

  return {
    success: true,
    mergedDocument: mergeResult.document,
    mergeResult,
    individualResults: results,
    fileStatuses,
    totalPages: mergeResult.document.totalPages || 0,
    totalTransactions: mergeResult.document.totalTransactions || 0,
    totalProcessingTime: performance.now() - startTime,
    errors,
    warnings,
  };
}

/**
 * Estimate total processing time for a batch of files
 */
export function estimateBatchProcessingTime(files: File[]): { min: number; max: number } {
  // Rough estimate: 2-5 seconds per MB of PDF
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const sizeMB = totalSize / (1024 * 1024);
  
  return {
    min: Math.max(5, Math.round(sizeMB * 2)),
    max: Math.max(10, Math.round(sizeMB * 5)),
  };
}

/**
 * Validate files before batch processing
 */
export function validateBatchFiles(
  files: File[],
  maxFiles: number,
  maxSizePerFile: number = 50 * 1024 * 1024 // 50MB
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push('No files selected');
  }

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed. You selected ${files.length}.`);
  }

  files.forEach((file, i) => {
    if (!file.type.includes('pdf')) {
      errors.push(`File ${i + 1} (${file.name}) is not a PDF`);
    }
    if (file.size > maxSizePerFile) {
      const sizeMB = Math.round(file.size / (1024 * 1024));
      errors.push(`File ${i + 1} (${file.name}) is ${sizeMB}MB. Maximum is 50MB.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper: Convert processing stage to progress percentage
 */
function getStageProgress(stage: string): number {
  const stageMap: Record<string, number> = {
    'upload': 10,
    'extract': 50,
    'anchor': 60,
    'stitch': 70,
    'validate': 85,
    'output': 95,
    'complete': 100,
  };

  return stageMap[stage.toLowerCase()] || 50;
}
