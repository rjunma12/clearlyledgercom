/**
 * Main PDF Processing Pipeline
 * HARDENED: Accuracy-first, never fabricates data
 * 
 * Key principles:
 * 1. MANDATORY PDF detection on page 1 first
 * 2. NEVER OCR a text-based PDF
 * 3. Parallel page processing for speed
 * 4. All values must have provenance (traced to source)
 */

import type { TextElement, Locale, ProcessingStage, ProcessingResult } from './ruleEngine/types';
import { loadPdfDocument, extractTextFromPage, renderPageToCanvas, analyzePdfType, isScannedPage, type PdfType, type PdfAnalysisResult } from './pdfUtils';
import { processImage, terminateWorker, getTesseractLanguages } from './ocrService';
import { correctOCRElements } from './ruleEngine/ocrCorrection';
import { processDocument } from './ruleEngine';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

// Maximum pages for client-side OCR (scanned PDFs only)
const MAX_OCR_PAGES = 3;

// Parallel processing concurrency (increased from 4 for faster multi-page processing)
const CONCURRENCY = 6;

export interface PDFProcessingOptions {
  /**
   * Force OCR even for digital PDFs
   * @deprecated OCR is now only used for scanned PDFs
   */
  forceOCR?: boolean;
  
  /**
   * Languages for OCR (auto-detected from locale if not specified)
   */
  ocrLanguages?: string[];
  
  /**
   * Apply image preprocessing before OCR
   */
  preprocessOCR?: boolean;
  
  /**
   * Maximum pages to process (0 = no limit)
   */
  maxPages?: number;
  
  /**
   * Expected locale for parsing
   */
  locale?: Locale;
  
  /**
   * Minimum OCR confidence threshold (0-1)
   */
  confidenceThreshold?: number;
  
  /**
   * Progress callback
   */
  onProgress?: (stage: ProcessingStage) => void;
}

export interface PageProcessingResult {
  pageNumber: number;
  textElements: TextElement[];
  isScanned: boolean;
  ocrConfidence?: number;
  processingTime: number;
}

const DEFAULT_OPTIONS: PDFProcessingOptions = {
  forceOCR: false,
  preprocessOCR: true,
  maxPages: 0,
  locale: 'auto',
  confidenceThreshold: 0.6,
};

// =============================================================================
// PARALLEL TEXT EXTRACTION (TEXT-BASED PDFs)
// =============================================================================

/**
 * Extract text from a text-based PDF using parallel processing
 * NEVER runs OCR - uses pdf.js text layer only
 */
async function extractTextBasedPDF(
  document: PDFDocumentProxy,
  pagesToProcess: number,
  onProgress: (progress: number, message: string) => void
): Promise<TextElement[]> {
  const allElements: TextElement[] = [];
  
  // Process pages in parallel batches
  for (let batch = 0; batch < pagesToProcess; batch += CONCURRENCY) {
    const pageNumbers = Array.from(
      { length: Math.min(CONCURRENCY, pagesToProcess - batch) },
      (_, i) => batch + i + 1
    );
    
    const results = await Promise.all(
      pageNumbers.map(async (pageNum) => {
        const page = await document.getPage(pageNum);
        return extractTextFromPage(page, pageNum);
      })
    );
    
    results.forEach(elements => allElements.push(...elements));
    
    const progress = Math.round(((batch + pageNumbers.length) / pagesToProcess) * 100);
    onProgress(progress, `Extracting text from page ${batch + pageNumbers.length}/${pagesToProcess}...`);
  }
  
  return allElements;
}

// =============================================================================
// OCR EXTRACTION (SCANNED PDFs ONLY)
// =============================================================================

/**
 * Extract text from a scanned PDF using OCR
 * Limited to MAX_OCR_PAGES pages
 */
async function extractScannedPDF(
  document: PDFDocumentProxy,
  pagesToProcess: number,
  languages: string[],
  options: PDFProcessingOptions,
  onProgress: (progress: number, message: string) => void
): Promise<TextElement[]> {
  const allElements: TextElement[] = [];
  
  // Sequential OCR processing (Tesseract.js is not parallel-safe)
  for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
    const page = await document.getPage(pageNum);
    const canvas = await renderPageToCanvas(page, 3.0); // 3.0 scale (~216 DPI) - 44% fewer pixels, still accurate
    
    const ocrResult = await processImage(canvas, pageNum, {
      languages,
      preprocess: options.preprocessOCR,
      confidenceThreshold: options.confidenceThreshold,
    });
    
    // Apply OCR corrections
    const correctedElements = correctOCRElements(ocrResult.textElements);
    allElements.push(...correctedElements);
    
    const progress = Math.round((pageNum / pagesToProcess) * 100);
    onProgress(progress, `OCR processing page ${pageNum}/${pagesToProcess}...`);
  }
  
  return allElements;
}

// =============================================================================
// MAIN PROCESSING FUNCTION
// =============================================================================

/**
 * Main PDF processing function
 * HARDENED: Implements mandatory PDF type detection and parallel processing
 */
export async function processPDF(
  file: File,
  options: Partial<PDFProcessingOptions> = {}
): Promise<ProcessingResult> {
  const fullOptions: PDFProcessingOptions = { ...DEFAULT_OPTIONS, ...options };
  const stages: ProcessingStage[] = [];
  
  const updateStage = (stage: ProcessingStage) => {
    const existingIndex = stages.findIndex(s => s.stage === stage.stage);
    if (existingIndex >= 0) {
      stages[existingIndex] = stage;
    } else {
      stages.push(stage);
    }
    fullOptions.onProgress?.(stage);
  };
  
  try {
    // Stage 1: Upload/Load
    updateStage({ stage: 'upload', status: 'processing', progress: 0 });
    const { document, totalPages } = await loadPdfDocument(file);
    updateStage({ stage: 'upload', status: 'complete', progress: 100 });
    
    // ==========================================================
    // MANDATORY STEP: Analyze PDF type from page 1 ONLY
    // ==========================================================
    updateStage({ stage: 'extract', status: 'processing', progress: 0, message: 'Analyzing PDF type...' });
    
    const pdfAnalysis = await analyzePdfType(document);
    console.log(`[PDF Processor] PDF Type: ${pdfAnalysis.pdfType} (${pdfAnalysis.textLength} chars on page 1)`);
    
    // Determine pages to process
    const pagesToProcess = fullOptions.maxPages && fullOptions.maxPages < totalPages
      ? fullOptions.maxPages
      : totalPages;
    
    // ==========================================================
    // ROUTE: Text-based vs Scanned PDF
    // ==========================================================
    let allTextElements: TextElement[] = [];
    let hasScannedPages = false;
    
    if (pdfAnalysis.pdfType === 'TEXT_BASED') {
      // TEXT-BASED: Use pdf.js text extraction only - NEVER OCR
      allTextElements = await extractTextBasedPDF(
        document,
        pagesToProcess,
        (progress, message) => updateStage({
          stage: 'extract',
          status: 'processing',
          progress,
          message,
        })
      );
    } else {
      // SCANNED: Limited OCR with page cap
      if (pagesToProcess > MAX_OCR_PAGES) {
        return {
          success: false,
          errors: [{
            code: 'OCR_PAGE_LIMIT',
            message: `Scanned PDF has ${pagesToProcess} pages. Maximum ${MAX_OCR_PAGES} pages supported for OCR. Please upload a digital PDF.`,
            recoverable: false,
          }],
          warnings: [],
          stages,
          totalDuration: 0,
        };
      }
      
      hasScannedPages = true;
      const languages = fullOptions.ocrLanguages || getTesseractLanguages(fullOptions.locale || 'auto');
      
      allTextElements = await extractScannedPDF(
        document,
        pagesToProcess,
        languages,
        fullOptions,
        (progress, message) => updateStage({
          stage: 'extract',
          status: 'processing',
          progress,
          message,
        })
      );
    }
    
    updateStage({ stage: 'extract', status: 'complete', progress: 100 });
    
    // Stage 3-5: Process through rule engine
    let result = await processDocument(file.name, allTextElements, {
      localeDetection: fullOptions.locale || 'auto',
      confidenceThreshold: fullOptions.confidenceThreshold || 0.6,
    });
    
    // Store PDF type in result for confidence scoring
    if (result.document) {
      (result.document as any).pdfType = pdfAnalysis.pdfType;
    }
    
    // OCR FALLBACK: If 0 transactions from text-based PDF, try OCR
    // This handles edge case of PDFs with broken text layers
    const hasTransactions = result.document && result.document.totalTransactions > 0;
    
    if (!hasTransactions && pdfAnalysis.pdfType === 'TEXT_BASED' && pagesToProcess <= MAX_OCR_PAGES) {
      console.log('[PDF Processor] 0 transactions from text extraction, triggering OCR fallback...');
      
      updateStage({
        stage: 'extract',
        status: 'processing',
        progress: 0,
        message: 'Text extraction failed, trying OCR fallback...',
      });
      
      hasScannedPages = true;
      const languages = fullOptions.ocrLanguages || getTesseractLanguages(fullOptions.locale || 'auto');
      
      allTextElements = await extractScannedPDF(
        document,
        pagesToProcess,
        languages,
        fullOptions,
        (progress, message) => updateStage({
          stage: 'extract',
          status: 'processing',
          progress,
          message: `OCR fallback: ${message}`,
        })
      );
      
      updateStage({ stage: 'extract', status: 'complete', progress: 100 });
      
      // Re-process with OCR results
      result = await processDocument(file.name, allTextElements, {
        localeDetection: fullOptions.locale || 'auto',
        confidenceThreshold: fullOptions.confidenceThreshold || 0.6,
      });
      
      result.warnings.push('Text extraction returned no transactions. Used OCR fallback.');
    }
    
    // Clean up OCR worker if used
    if (hasScannedPages) {
      await terminateWorker();
    }
    
    // Add OCR metadata to result
    if (result.document && hasScannedPages) {
      result.warnings.push(
        `Document was processed using OCR (scanned/image-based PDF detected)`
      );
    }
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Clean up worker on error
    await terminateWorker();
    
    return {
      success: false,
      errors: [{
        code: 'PDF_PROCESSING_ERROR',
        message: errorMessage,
        recoverable: false,
      }],
      warnings: [],
      stages,
      totalDuration: 0,
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Quick check if a PDF contains scanned pages
 * @deprecated Use analyzePdfType() for document-level detection
 */
export async function detectScannedPages(file: File): Promise<{ 
  totalPages: number; 
  scannedPages: number[];
  digitalPages: number[];
}> {
  const { document, totalPages } = await loadPdfDocument(file);
  const scannedPages: number[] = [];
  const digitalPages: number[] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    const page = await document.getPage(i);
    const scanned = await isScannedPage(page);
    
    if (scanned) {
      scannedPages.push(i);
    } else {
      digitalPages.push(i);
    }
  }
  
  return { totalPages, scannedPages, digitalPages };
}

/**
 * Get estimated processing time for a PDF
 */
export function estimateProcessingTime(
  totalPages: number,
  scannedPageCount: number
): { minSeconds: number; maxSeconds: number } {
  // Digital pages: ~0.1-0.3s per page
  // Scanned pages: ~2-5s per page (depends on device)
  const digitalTime = (totalPages - scannedPageCount) * 0.2;
  const scannedTimeMin = scannedPageCount * 2;
  const scannedTimeMax = scannedPageCount * 5;
  
  return {
    minSeconds: Math.ceil(digitalTime + scannedTimeMin),
    maxSeconds: Math.ceil(digitalTime + scannedTimeMax),
  };
}
