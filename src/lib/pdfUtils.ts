/**
 * PDF Utilities for Text Extraction and Page Rendering
 * Uses pdfjs-dist for PDF processing (dynamically loaded)
 */

import type { PDFDocumentProxy, PDFPageProxy, TextItem } from 'pdfjs-dist/types/src/display/api';
import type { TextElement } from './ruleEngine/types';

// Dynamic import for pdfjs-dist to reduce initial bundle size
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

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
 * Extract text elements with bounding boxes from a PDF page
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
