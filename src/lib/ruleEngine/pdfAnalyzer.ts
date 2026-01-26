/**
 * PDF Type Analyzer
 * Mandatory first step: Determines if PDF is text-based or scanned
 * NEVER OCR a text-based PDF
 */

import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

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
 * Analyze ONLY page 1 to determine PDF type
 * This is the MANDATORY FIRST STEP before any processing
 * 
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
 * Returns false for text-based PDFs (>200 chars on page 1)
 */
export function shouldUseOCR(analysis: PdfAnalysisResult): boolean {
  return analysis.pdfType === 'SCANNED';
}

/**
 * Get user-friendly message about PDF type
 */
export function getPdfTypeMessage(analysis: PdfAnalysisResult): string {
  if (analysis.pdfType === 'TEXT_BASED') {
    return 'Digital PDF detected - using fast text extraction';
  }
  return `Scanned PDF detected (${analysis.pageCount} pages) - OCR processing may be slower`;
}
