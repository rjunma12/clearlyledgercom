/**
 * Main PDF Processing Pipeline
 * Orchestrates PDF loading, OCR, and rule engine integration
 */

import type { TextElement, Locale, ProcessingStage, ProcessingResult } from './ruleEngine/types';
import { loadPdfDocument, extractTextFromPage, renderPageToCanvas, isScannedPage } from './pdfUtils';
import { processImage, terminateWorker, getTesseractLanguages } from './ocrService';
import { correctOCRElements } from './ruleEngine/ocrCorrection';
import { processDocument } from './ruleEngine';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

export interface PDFProcessingOptions {
  /**
   * Force OCR even for digital PDFs
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

/**
 * Process a single PDF page
 */
async function processPage(
  document: PDFDocumentProxy,
  pageNumber: number,
  options: PDFProcessingOptions
): Promise<PageProcessingResult> {
  const startTime = performance.now();
  const page = await document.getPage(pageNumber);
  
  // Check if page is scanned
  const scanned = options.forceOCR || await isScannedPage(page);
  
  let textElements: TextElement[];
  let ocrConfidence: number | undefined;
  
  if (scanned) {
    // Render page and run OCR
    const canvas = await renderPageToCanvas(page, 2.0); // 2x scale for better accuracy
    const languages = options.ocrLanguages || getTesseractLanguages(options.locale || 'auto');
    
    const ocrResult = await processImage(canvas, pageNumber, {
      languages,
      preprocess: options.preprocessOCR,
      confidenceThreshold: options.confidenceThreshold,
    });
    
    textElements = ocrResult.textElements;
    ocrConfidence = ocrResult.overallConfidence;
    
    // Apply OCR corrections
    textElements = correctOCRElements(textElements);
  } else {
    // Extract text directly from PDF
    textElements = await extractTextFromPage(page, pageNumber);
  }
  
  const processingTime = performance.now() - startTime;
  
  return {
    pageNumber,
    textElements,
    isScanned: scanned,
    ocrConfidence,
    processingTime,
  };
}

/**
 * Main PDF processing function
 * Handles both digital and scanned PDFs automatically
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
    
    // Determine pages to process
    const pagesToProcess = fullOptions.maxPages && fullOptions.maxPages < totalPages
      ? fullOptions.maxPages
      : totalPages;
    
    // Initialize OCR worker if needed (preload for first scanned page detection)
    const languages = fullOptions.ocrLanguages || getTesseractLanguages(fullOptions.locale || 'auto');
    
    // Stage 2: Extract text from all pages
    updateStage({ stage: 'extract', status: 'processing', progress: 0 });
    
    let allTextElements: TextElement[] = [];
    const pageResults: PageProcessingResult[] = [];
    let hasScannedPages = false;
    
    for (let i = 1; i <= pagesToProcess; i++) {
      const result = await processPage(document, i, fullOptions);
      pageResults.push(result);
      allTextElements.push(...result.textElements);
      
      if (result.isScanned) {
        hasScannedPages = true;
      }
      
      updateStage({
        stage: 'extract',
        status: 'processing',
        progress: Math.round((i / pagesToProcess) * 100),
        message: result.isScanned 
          ? `OCR processing page ${i}/${pagesToProcess}...`
          : `Extracting text from page ${i}/${pagesToProcess}...`,
      });
    }
    
    updateStage({ stage: 'extract', status: 'complete', progress: 100 });
    
    // Stage 3-5: Process through rule engine
    let result = await processDocument(file.name, allTextElements, {
      localeDetection: fullOptions.locale || 'auto',
      confidenceThreshold: fullOptions.confidenceThreshold || 0.6,
    });
    
    // OCR FALLBACK: If 0 transactions extracted and we haven't tried OCR yet, force OCR
    const hasTransactions = result.document && result.document.totalTransactions > 0;
    const digitalPagesExist = pageResults.some(p => !p.isScanned);
    
    if (!hasTransactions && digitalPagesExist && !fullOptions.forceOCR) {
      console.log('[PDF Processor] 0 transactions from text extraction, triggering OCR fallback...');
      
      updateStage({
        stage: 'extract',
        status: 'processing',
        progress: 0,
        message: 'Text extraction failed, trying OCR fallback...',
      });
      
      // Re-process all pages with forced OCR
      allTextElements = [];
      pageResults.length = 0;
      hasScannedPages = true;
      
      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await document.getPage(i);
        const canvas = await renderPageToCanvas(page, 2.0);
        
        const ocrResult = await processImage(canvas, i, {
          languages,
          preprocess: fullOptions.preprocessOCR,
          confidenceThreshold: fullOptions.confidenceThreshold,
        });
        
        const correctedElements = correctOCRElements(ocrResult.textElements);
        allTextElements.push(...correctedElements);
        
        pageResults.push({
          pageNumber: i,
          textElements: correctedElements,
          isScanned: true,
          ocrConfidence: ocrResult.overallConfidence,
          processingTime: ocrResult.processingTime,
        });
        
        updateStage({
          stage: 'extract',
          status: 'processing',
          progress: Math.round((i / pagesToProcess) * 100),
          message: `OCR fallback: processing page ${i}/${pagesToProcess}...`,
        });
      }
      
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
    if (result.document) {
      const scannedPageCount = pageResults.filter(p => p.isScanned).length;
      const avgOcrConfidence = pageResults
        .filter(p => p.ocrConfidence !== undefined)
        .reduce((sum, p) => sum + (p.ocrConfidence || 0), 0) / (scannedPageCount || 1);
      
      if (scannedPageCount > 0) {
        result.warnings.push(
          `${scannedPageCount} of ${pagesToProcess} pages were processed using OCR (average confidence: ${(avgOcrConfidence * 100).toFixed(1)}%)`
        );
      }
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

/**
 * Quick check if a PDF contains scanned pages
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
