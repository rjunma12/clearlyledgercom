/**
 * OCR Service using Tesseract.js
 * Provides browser-based OCR without external API costs
 * Dynamically loaded to reduce initial bundle size
 */

import type { Worker, RecognizeResult, PSM } from 'tesseract.js';
import type { TextElement, Locale } from './ruleEngine/types';
import { preprocessForOCR } from './imagePreprocessing';

export interface OCROptions {
  languages?: string[];
  preprocess?: boolean;
  confidenceThreshold?: number;
}

export interface OCRPageResult {
  pageNumber: number;
  textElements: TextElement[];
  overallConfidence: number;
  processingTime: number;
}

// Tesseract language code mapping
const LOCALE_TO_TESSERACT: Partial<Record<Locale, string[]>> = {
  'en-US': ['eng'],
  'en-GB': ['eng'],
  'en-IN': ['eng'],
  'en-AE': ['eng'],
  'es-ES': ['spa'],
  'es-MX': ['spa'],
  'fr-FR': ['fra'],
  'de-DE': ['deu'],
  'ar-AE': ['ara', 'eng'],
  'ar-SA': ['ara', 'eng'],
  'hi-IN': ['hin', 'eng'],
  'zh-CN': ['chi_sim'],
  'ja-JP': ['jpn'],
  'auto': ['eng'],
};

let workerInstance: Worker | null = null;
let currentLanguages: string[] = [];
let tesseractModule: typeof import('tesseract.js') | null = null;

/**
 * Dynamically load Tesseract.js
 */
async function getTesseract() {
  if (!tesseractModule) {
    tesseractModule = await import('tesseract.js');
  }
  return tesseractModule;
}

/**
 * Get Tesseract language codes for a locale
 */
export function getTesseractLanguages(locale: Locale): string[] {
  return LOCALE_TO_TESSERACT[locale] || ['eng'];
}

/**
 * Initialize or get the Tesseract worker
 */
export async function getWorker(languages: string[] = ['eng']): Promise<Worker> {
  const langKey = languages.sort().join('+');
  const currentKey = currentLanguages.sort().join('+');
  
  if (workerInstance && langKey === currentKey) {
    return workerInstance;
  }
  
  // Terminate existing worker if languages changed
  if (workerInstance) {
    await workerInstance.terminate();
  }
  
  const tesseract = await getTesseract();
  
  workerInstance = await tesseract.createWorker(languages.join('+'), 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // Progress can be tracked here if needed
      }
    },
  });
  
  // Configure for tabular bank statement layout
  await workerInstance.setParameters({
    tessedit_pageseg_mode: '6' as unknown as PSM, // PSM 6: Assume uniform block of text
    preserve_interword_spaces: '1', // Keep column spacing for tables
  });
  
  currentLanguages = [...languages];
  return workerInstance;
}

/**
 * Terminate the worker and free resources
 */
export async function terminateWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
    currentLanguages = [];
  }
}

/**
 * Process a canvas image with OCR
 */
export async function processImage(
  canvas: HTMLCanvasElement,
  pageNumber: number,
  options: OCROptions = {}
): Promise<OCRPageResult> {
  const startTime = performance.now();
  const { languages = ['eng'], preprocess = true, confidenceThreshold = 0.6 } = options;
  
  // Preprocess image for better OCR accuracy
  const processedCanvas = preprocess ? preprocessForOCR(canvas) : canvas;
  
  // Get or initialize worker
  const worker = await getWorker(languages);
  
  // Perform OCR
  const result: RecognizeResult = await worker.recognize(processedCanvas);
  
  // Convert Tesseract output to TextElements
  const textElements: TextElement[] = [];
  let totalConfidence = 0;
  let wordCount = 0;
  
  for (const line of result.data.lines) {
    for (const word of line.words) {
      const confidence = word.confidence / 100; // Tesseract uses 0-100
      
      if (confidence < confidenceThreshold) continue;
      
      const bbox = word.bbox;
      textElements.push({
        text: word.text,
        boundingBox: {
          x: bbox.x0,
          y: bbox.y0,
          width: bbox.x1 - bbox.x0,
          height: bbox.y1 - bbox.y0,
        },
        pageNumber,
        confidence,
        source: 'ocr',
      });
      
      totalConfidence += confidence;
      wordCount++;
    }
  }
  
  const processingTime = performance.now() - startTime;
  
  return {
    pageNumber,
    textElements,
    overallConfidence: wordCount > 0 ? totalConfidence / wordCount : 0,
    processingTime,
  };
}

/**
 * Process multiple canvases in sequence
 */
export async function processPages(
  pages: Array<{ canvas: HTMLCanvasElement; pageNumber: number }>,
  options: OCROptions = {},
  onProgress?: (current: number, total: number, pageResult?: OCRPageResult) => void
): Promise<OCRPageResult[]> {
  const results: OCRPageResult[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    const { canvas, pageNumber } = pages[i];
    const result = await processImage(canvas, pageNumber, options);
    results.push(result);
    onProgress?.(i + 1, pages.length, result);
  }
  
  return results;
}

/**
 * Quick OCR check to validate if a page contains text
 */
export async function quickScan(canvas: HTMLCanvasElement): Promise<boolean> {
  const worker = await getWorker(['eng']);
  const result = await worker.recognize(canvas);
  return result.data.lines.length > 0;
}
