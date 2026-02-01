/**
 * Text Quality Analyzer
 * Detects corrupted or gibberish text layers and triggers OCR fallback
 * 
 * Problem: Some PDFs have broken text layers that return garbage characters
 * Solution: Score text quality and trigger OCR when quality is too low
 */

import type { TextElement } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface TextQualityResult {
  score: number;                    // 0-100
  shouldTriggerOCR: boolean;        // True if quality < threshold
  issues: string[];                 // Detected quality issues
  metrics: TextQualityMetrics;
}

export interface TextQualityMetrics {
  totalElements: number;
  totalCharacters: number;
  specialCharRatio: number;
  validWordRatio: number;
  hasDatePatterns: boolean;
  hasNumericPatterns: boolean;
  averageWordLength: number;
  unicodeMixRatio: number;          // Ratio of mixed unicode blocks (gibberish indicator)
}

// =============================================================================
// QUALITY THRESHOLDS
// =============================================================================

const OCR_FALLBACK_THRESHOLD = 40;  // Trigger OCR if score below this

/**
 * Date patterns that indicate valid text extraction
 */
const DATE_PATTERNS = [
  /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/,
  /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/,
  /[A-Za-z]{3,9}\s+\d{1,2}/,
  /\d{1,2}\s+[A-Za-z]{3,9}/,
];

/**
 * Numeric patterns for financial documents
 */
const NUMERIC_PATTERNS = [
  /[\d,]+\.\d{2}/,                  // Standard decimal
  /[₹$£€¥]\s*[\d,]+/,               // Currency amounts
];

/**
 * Common valid words in financial documents
 */
const COMMON_FINANCIAL_WORDS = new Set([
  'balance', 'credit', 'debit', 'transfer', 'payment', 'deposit', 'withdrawal',
  'date', 'description', 'amount', 'bank', 'account', 'statement', 'transaction',
  'opening', 'closing', 'total', 'available', 'pending', 'reference', 'ref',
  'from', 'to', 'the', 'and', 'for', 'of', 'in', 'on', 'at', 'by', 'with',
]);

// =============================================================================
// QUALITY ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Calculate ratio of special/unusual characters
 * High ratio indicates potential gibberish
 */
function calculateSpecialCharRatio(text: string): number {
  if (text.length === 0) return 0;
  
  // Count characters that are NOT: letters, digits, spaces, common punctuation
  const normalChars = text.replace(/[a-zA-Z0-9\s.,\-\/():'"₹$£€¥%@#&*+=]/g, '');
  return normalChars.length / text.length;
}

/**
 * Calculate ratio of valid English-like words
 */
function calculateValidWordRatio(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return 0;
  
  const validWords = words.filter(word => {
    // Known financial words
    if (COMMON_FINANCIAL_WORDS.has(word)) return true;
    
    // Standard English-like pattern (letters only, reasonable length)
    if (/^[a-z]{2,15}$/.test(word)) return true;
    
    // Alphanumeric codes (account numbers, references)
    if (/^[a-z0-9]{4,20}$/i.test(word)) return true;
    
    return false;
  });
  
  return validWords.length / words.length;
}

/**
 * Check for mixed unicode blocks (gibberish indicator)
 * Valid text typically uses consistent unicode blocks
 */
function calculateUnicodeMixRatio(text: string): number {
  if (text.length < 10) return 0;
  
  const blocks: Set<string> = new Set();
  
  for (const char of text) {
    const code = char.charCodeAt(0);
    
    if (code < 128) blocks.add('basic-latin');
    else if (code < 256) blocks.add('latin-extended');
    else if (code >= 0x0900 && code <= 0x097F) blocks.add('devanagari');
    else if (code >= 0x4E00 && code <= 0x9FFF) blocks.add('cjk');
    else if (code >= 0x0600 && code <= 0x06FF) blocks.add('arabic');
    else if (code >= 0x0080 && code <= 0x024F) blocks.add('latin-supplement');
    else blocks.add('other');
  }
  
  // More than 3 different unicode blocks in a short text = suspicious
  if (blocks.size > 3 && text.length < 200) {
    return (blocks.size - 2) / blocks.size;
  }
  
  return 0;
}

/**
 * Calculate average word length
 * Gibberish often has unusual word lengths
 */
function calculateAverageWordLength(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  
  const totalLength = words.reduce((sum, w) => sum + w.length, 0);
  return totalLength / words.length;
}

/**
 * Check if text contains date patterns
 */
function hasDatePatterns(text: string): boolean {
  return DATE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains numeric/financial patterns
 */
function hasNumericPatterns(text: string): boolean {
  return NUMERIC_PATTERNS.some(pattern => pattern.test(text));
}

// =============================================================================
// MAIN QUALITY SCORING
// =============================================================================

/**
 * Calculate text quality score from extracted elements
 * Score 0-100:
 * - 80-100: Good quality, use text extraction
 * - 40-79: Marginal quality, may work
 * - 0-39: Poor quality, trigger OCR fallback
 */
export function calculateTextQualityScore(elements: TextElement[]): TextQualityResult {
  const issues: string[] = [];
  
  if (elements.length === 0) {
    return {
      score: 0,
      shouldTriggerOCR: true,
      issues: ['No text elements extracted'],
      metrics: {
        totalElements: 0,
        totalCharacters: 0,
        specialCharRatio: 0,
        validWordRatio: 0,
        hasDatePatterns: false,
        hasNumericPatterns: false,
        averageWordLength: 0,
        unicodeMixRatio: 0,
      },
    };
  }
  
  // Combine all text
  const allText = elements.map(e => e.text).join(' ');
  const totalCharacters = allText.length;
  
  if (totalCharacters < 50) {
    return {
      score: 20,
      shouldTriggerOCR: true,
      issues: ['Very little text extracted'],
      metrics: {
        totalElements: elements.length,
        totalCharacters,
        specialCharRatio: 0,
        validWordRatio: 0,
        hasDatePatterns: false,
        hasNumericPatterns: false,
        averageWordLength: 0,
        unicodeMixRatio: 0,
      },
    };
  }
  
  // Calculate metrics
  const specialCharRatio = calculateSpecialCharRatio(allText);
  const validWordRatio = calculateValidWordRatio(allText);
  const unicodeMixRatio = calculateUnicodeMixRatio(allText);
  const avgWordLength = calculateAverageWordLength(allText);
  const hasDatePat = hasDatePatterns(allText);
  const hasNumericPat = hasNumericPatterns(allText);
  
  const metrics: TextQualityMetrics = {
    totalElements: elements.length,
    totalCharacters,
    specialCharRatio,
    validWordRatio,
    hasDatePatterns: hasDatePat,
    hasNumericPatterns: hasNumericPat,
    averageWordLength: avgWordLength,
    unicodeMixRatio,
  };
  
  // Score calculation (weighted)
  let score = 100;
  
  // Special character penalty (up to -40 points)
  if (specialCharRatio > 0.4) {
    score -= 40;
    issues.push(`High special character ratio: ${(specialCharRatio * 100).toFixed(1)}%`);
  } else if (specialCharRatio > 0.2) {
    score -= 20;
    issues.push(`Elevated special character ratio: ${(specialCharRatio * 100).toFixed(1)}%`);
  } else if (specialCharRatio > 0.1) {
    score -= 10;
  }
  
  // Valid word ratio bonus/penalty (up to ±20 points)
  if (validWordRatio < 0.2) {
    score -= 20;
    issues.push(`Low valid word ratio: ${(validWordRatio * 100).toFixed(1)}%`);
  } else if (validWordRatio < 0.4) {
    score -= 10;
  } else if (validWordRatio > 0.6) {
    score += 10;
  }
  
  // Date pattern bonus (+15 points if found)
  if (!hasDatePat) {
    score -= 15;
    issues.push('No date patterns found');
  }
  
  // Numeric pattern bonus (+10 points if found)
  if (!hasNumericPat) {
    score -= 10;
    issues.push('No numeric/financial patterns found');
  }
  
  // Unicode mix penalty (up to -20 points)
  if (unicodeMixRatio > 0.3) {
    score -= 20;
    issues.push(`High unicode block mixing: ${(unicodeMixRatio * 100).toFixed(1)}%`);
  } else if (unicodeMixRatio > 0.15) {
    score -= 10;
  }
  
  // Average word length check (too short or too long = suspicious)
  if (avgWordLength < 2 || avgWordLength > 20) {
    score -= 15;
    issues.push(`Unusual average word length: ${avgWordLength.toFixed(1)}`);
  }
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));
  
  console.log(`[TextQualityAnalyzer] Score: ${score}, Elements: ${elements.length}, Chars: ${totalCharacters}`);
  if (issues.length > 0) {
    console.log(`[TextQualityAnalyzer] Issues: ${issues.join(', ')}`);
  }
  
  return {
    score,
    shouldTriggerOCR: score < OCR_FALLBACK_THRESHOLD,
    issues,
    metrics,
  };
}

/**
 * Quick check if text quality warrants OCR fallback
 */
export function shouldTriggerOCRFallback(elements: TextElement[]): boolean {
  const result = calculateTextQualityScore(elements);
  return result.shouldTriggerOCR;
}

/**
 * Get human-readable quality description
 */
export function getQualityDescription(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
}
