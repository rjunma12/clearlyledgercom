/**
 * PDF Utilities for Text Extraction and Page Rendering
 * Uses pdfjs-dist for PDF processing (dynamically loaded)
 * 
 * HARDENED: Implements mandatory PDF type detection
 */

import type { PDFDocumentProxy, PDFPageProxy, TextItem } from 'pdfjs-dist/types/src/display/api';
import type { TextElement } from './ruleEngine/types';

// Import bundled worker from node_modules (Vite handles this correctly)
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Dynamic import for pdfjs-dist to reduce initial bundle size
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Use bundled worker instead of CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  }
  return pdfjsLib;
}

// =============================================================================
// PDF TYPE DETECTION (MANDATORY FIRST STEP)
// =============================================================================

export type PdfType = 'TEXT_BASED' | 'SCANNED';

export interface PdfAnalysisResult {
  pdfType: PdfType;
  textLength: number;
  pageCount: number;
  analysisTimeMs: number;
}

// Threshold: >200 chars on page 1 = text-based PDF
const TEXT_THRESHOLD = 200;

/**
 * MANDATORY FIRST STEP: Analyze ONLY page 1 to determine PDF type
 * Rule: If textLength > 200 on page 1, NEVER run OCR on any page
 */
export async function analyzePdfType(document: PDFDocumentProxy): Promise<PdfAnalysisResult> {
  const startTime = performance.now();
  
  const page = await document.getPage(1);
  const textContent = await page.getTextContent();
  
  // Extract all text from page 1
  const totalText = textContent.items
    .filter((item): item is TextItem => 'str' in item)
    .map(item => item.str)
    .join('');
  
  const textLength = totalText.trim().length;
  const analysisTimeMs = performance.now() - startTime;
  
  console.log(`[PDF Analyzer] Page 1 text length: ${textLength} chars (threshold: ${TEXT_THRESHOLD})`);
  
  return {
    pdfType: textLength > TEXT_THRESHOLD ? 'TEXT_BASED' : 'SCANNED',
    textLength,
    pageCount: document.numPages,
    analysisTimeMs,
  };
}

/**
 * Check if OCR should be used for this PDF
 */
export function shouldUseOCR(analysis: PdfAnalysisResult): boolean {
  return analysis.pdfType === 'SCANNED';
}

// =============================================================================
// PDF LOADING
// =============================================================================

export interface PDFLoadResult {
  document: PDFDocumentProxy;
  totalPages: number;
}

export interface PageTextResult {
  pageNumber: number;
  textElements: TextElement[];
  isScanned: boolean;
}

/**
 * Load a PDF document from a File object
 */
export async function loadPdfDocument(file: File): Promise<PDFLoadResult> {
  const pdfjs = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  return {
    document,
    totalPages: document.numPages,
  };
}

/**
 * Check if a page is scanned (has minimal or no text layer)
 * @deprecated Use analyzePdfType() at document level instead
 */
export async function isScannedPage(page: PDFPageProxy, threshold: number = 10): Promise<boolean> {
  const textContent = await page.getTextContent();
  
  // Filter out whitespace-only items
  const meaningfulItems = textContent.items.filter((item) => {
    if ('str' in item) {
      return (item as TextItem).str.trim().length > 0;
    }
    return false;
  });
  
  return meaningfulItems.length < threshold;
}

/**
 * Extract text elements with bounding boxes and font info from a PDF page
 * NEW: Includes font metadata for header detection
 */
export async function extractTextFromPage(
  page: PDFPageProxy,
  pageNumber: number
): Promise<TextElement[]> {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });
  const textElements: TextElement[] = [];
  
  for (const item of textContent.items) {
    if (!('str' in item) || !(item as TextItem).str.trim()) continue;
    
    const textItem = item as TextItem;
    const transform = textItem.transform;
    
    // Calculate bounding box from transform matrix
    // transform = [scaleX, skewX, skewY, scaleY, translateX, translateY]
    const x = transform[4];
    const y = viewport.height - transform[5]; // Flip Y coordinate
    const width = textItem.width || 0;
    const height = textItem.height || Math.abs(transform[0]); // Use scaleX as fallback
    
    // Extract font size from transform (scale factor)
    const fontSize = Math.abs(transform[0]);
    
    // Detect bold from font name (common patterns: Bold, -Bold, _Bold, etc.)
    const fontName = (textItem as any).fontName || '';
    const isBold = /bold/i.test(fontName) || 
                   /-B$/i.test(fontName) || 
                   /_B$/i.test(fontName) ||
                   /BT$/i.test(fontName);
    const isItalic = /italic|oblique/i.test(fontName) || 
                     /-I$/i.test(fontName) || 
                     /_I$/i.test(fontName);
    
    textElements.push({
      text: textItem.str,
      boundingBox: {
        x,
        y,
        width,
        height,
      },
      pageNumber,
      confidence: 1.0, // Text layer has 100% confidence
      source: 'text-layer',
      fontInfo: {
        fontName: fontName || undefined,
        fontSize: fontSize > 0 ? fontSize : undefined,
        isBold,
        isItalic,
      },
    });
  }
  
  return textElements;
}

/**
 * Render a PDF page to a canvas for OCR processing
 */
export async function renderPageToCanvas(
  page: PDFPageProxy,
  scale: number = 2.0 // Higher scale = better OCR accuracy
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Failed to get canvas 2D context');
  }
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
  
  return canvas;
}

/**
 * Get page dimensions
 */
export function getPageDimensions(page: PDFPageProxy): { width: number; height: number } {
  const viewport = page.getViewport({ scale: 1.0 });
  return {
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Process all pages of a PDF and determine which need OCR
 */
export async function analyzePdfPages(
  document: PDFDocumentProxy,
  onProgress?: (current: number, total: number) => void
): Promise<{ pageNumber: number; isScanned: boolean }[]> {
  const results: { pageNumber: number; isScanned: boolean }[] = [];
  
  for (let i = 1; i <= document.numPages; i++) {
    const page = await document.getPage(i);
    const scanned = await isScannedPage(page);
    results.push({ pageNumber: i, isScanned: scanned });
    onProgress?.(i, document.numPages);
  }
  
  return results;
}
