/**
 * Server-Side PDF Processor (Node.js Compatible)
 * 
 * Uses pdfjs-dist for text extraction (no browser APIs).
 * OCR stays client-side only — scanned PDFs are rejected here.
 * Delegates structured parsing to the shared rule engine.
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { processDocument } from '../../src/lib/ruleEngine/index.js';
import type { TextElement, ProcessingResult, Locale } from '../../src/lib/ruleEngine/types.js';

// Disable PDF.js worker in Node.js — not needed server-side
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

// Polyfill browser globals that pdfjs-dist may reference
if (typeof globalThis.navigator === 'undefined') {
  (globalThis as any).navigator = { userAgent: 'node' };
}
if (typeof globalThis.HTMLCanvasElement === 'undefined') {
  (globalThis as any).HTMLCanvasElement = class {};
}
if (typeof globalThis.canvas === 'undefined') {
  (globalThis as any).canvas = {};
}

// Text threshold: >100 chars on page 1 = text-based PDF
const TEXT_THRESHOLD = 100;

// Parallel batch size
const CONCURRENCY = 6;

export interface ServerPDFOptions {
  locale?: Locale;
  confidenceThreshold?: number;
  maxPages?: number;
  fileName?: string;
}

export interface ServerPDFResult extends ProcessingResult {
  pdfType: 'TEXT_BASED' | 'SCANNED';
  totalPages: number;
  processingTimeMs: number;
}

/**
 * Main entry point for server-side PDF processing.
 * Accepts a raw PDF buffer, extracts text, and runs the rule engine.
 * 
 * IMPORTANT: Does NOT support OCR. Scanned PDFs must be processed client-side.
 */
export async function processPDFBuffer(
  buffer: Buffer,
  options: ServerPDFOptions = {}
): Promise<ServerPDFResult> {
  const startTime = Date.now();
  const uint8Array = new Uint8Array(buffer);

  // Load the PDF document
  const document = await getDocument({ data: uint8Array, useSystemFonts: true }).promise;
  const totalPages = document.numPages;

  // Step 1: Analyze PDF type from page 1
  const pdfType = await analyzePdfType(document);

  if (pdfType === 'SCANNED') {
    return {
      success: false,
      pdfType: 'SCANNED',
      totalPages,
      processingTimeMs: Date.now() - startTime,
      errors: [{
        code: 'SCANNED_PDF',
        message: 'Scanned PDFs must be processed client-side. Server only supports text-based PDFs.',
        recoverable: false,
      }],
      warnings: [],
      stages: [],
      totalDuration: Date.now() - startTime,
    };
  }

  // Step 2: Extract text from all pages
  const pagesToProcess = options.maxPages && options.maxPages < totalPages
    ? options.maxPages
    : totalPages;

  const allTextElements = await extractAllPages(document, pagesToProcess);

  // Step 3: Run through the shared rule engine
  const result = await processDocument(
    options.fileName || 'upload.pdf',
    allTextElements,
    {
      localeDetection: options.locale || 'auto',
      confidenceThreshold: options.confidenceThreshold || 0.6,
    }
  );

  return {
    ...result,
    pdfType: 'TEXT_BASED',
    totalPages,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Check page 1 text length to determine if PDF is text-based or scanned.
 */
async function analyzePdfType(document: PDFDocumentProxy): Promise<'TEXT_BASED' | 'SCANNED'> {
  const page = await document.getPage(1);
  const textContent = await page.getTextContent();

  const totalText = textContent.items
    .filter((item): item is TextItem => 'str' in item)
    .map(item => item.str)
    .join('');

  const textLength = totalText.trim().length;
  console.log(`[Server PDF] Page 1 text length: ${textLength} chars (threshold: ${TEXT_THRESHOLD})`);

  return textLength > TEXT_THRESHOLD ? 'TEXT_BASED' : 'SCANNED';
}

/**
 * Extract text elements from all pages using parallel batches.
 */
async function extractAllPages(
  document: PDFDocumentProxy,
  pagesToProcess: number
): Promise<TextElement[]> {
  const allElements: TextElement[] = [];

  for (let batch = 0; batch < pagesToProcess; batch += CONCURRENCY) {
    const pageNumbers = Array.from(
      { length: Math.min(CONCURRENCY, pagesToProcess - batch) },
      (_, i) => batch + i + 1
    );

    const results = await Promise.all(
      pageNumbers.map(pageNum => extractTextFromPage(document, pageNum))
    );

    results.forEach(elements => allElements.push(...elements));
  }

  return allElements;
}

/**
 * Extract TextElement[] from a single PDF page using getTextContent().
 */
async function extractTextFromPage(
  document: PDFDocumentProxy,
  pageNum: number
): Promise<TextElement[]> {
  const page = await document.getPage(pageNum);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });
  const elements: TextElement[] = [];

  for (const item of textContent.items) {
    if (!('str' in item) || !item.str.trim()) continue;

    const textItem = item as TextItem;
    const tx = textItem.transform;

    // transform is [scaleX, skewX, skewY, scaleY, translateX, translateY]
    const x = tx[4];
    const y = viewport.height - tx[5]; // Flip Y coordinate (PDF origin is bottom-left)
    const width = textItem.width;
    const height = Math.abs(tx[3]); // scaleY = approximate font size

    elements.push({
      text: textItem.str,
      boundingBox: { x, y, width, height },
      pageNumber: pageNum,
      confidence: 1.0,
      source: 'text-layer',
    });
  }

  return elements;
}
