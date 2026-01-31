/**
 * OCR Error Correction Module
 * Applies common corrections for OCR misrecognition in financial documents
 */

import type { TextElement } from './types';

// =============================================================================
// DATE-SPECIFIC OCR CORRECTIONS
// =============================================================================

// Date-specific corrections (more restrictive than numeric)
const DATE_OCR_CORRECTIONS: Record<string, string> = {
  'O': '0',
  'o': '0',
  'l': '1',
  'I': '1',
  '|': '1',
  'Z': '2',
  'S': '5',
  'B': '8',
  'g': '9',
  'q': '9',
};

/**
 * Check if a string looks like a date
 */
function isLikelyDate(str: string): boolean {
  // Has date separators and appropriate length
  return /[\/\-\.]/.test(str) && str.length >= 6 && str.length <= 12;
}

/**
 * Correct OCR errors specifically in date strings
 * More conservative than numeric corrections
 */
export function correctOCRDate(raw: string): string {
  if (!isLikelyDate(raw)) return raw;
  
  let result = raw;
  
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    
    // Skip separators and existing digits
    if (/[\d\/\-\.\s]/.test(char)) continue;
    
    // Apply date-specific correction
    if (DATE_OCR_CORRECTIONS[char]) {
      result = result.slice(0, i) + DATE_OCR_CORRECTIONS[char] + result.slice(i + 1);
    }
  }
  
  // Log if corrections were made
  if (result !== raw) {
    console.log(`[OCR Date Correction] "${raw}" -> "${result}"`);
  }
  
  return result;
}

// =============================================================================
// NUMERIC OCR CORRECTIONS
// =============================================================================

// Common OCR character confusions in numeric contexts
const NUMERIC_CORRECTIONS: Record<string, string> = {
  'O': '0',
  'o': '0',
  'Q': '0',
  'D': '0',
  'l': '1',
  'I': '1',
  'i': '1',
  '|': '1',
  '!': '1',
  'L': '1',
  'Z': '2',
  'z': '2',
  'E': '3',
  'A': '4',
  'S': '5',
  's': '5',
  'G': '6',
  'b': '6',
  'T': '7',
  'B': '8',
  'g': '9',
  'q': '9',
};

// Currency symbol corrections
const CURRENCY_CORRECTIONS: Record<string, string> = {
  'S': '$',
  '＄': '$',
  '﹩': '$',
  '€': '€',
  '£': '£',
  '¥': '¥',
  '₹': '₹',
  'Rs': '₹',
  'RS': '₹',
  'INR': '₹',
};

// Common word corrections in financial documents
const WORD_CORRECTIONS: Record<string, string> = {
  'DEBIT': 'DEBIT',
  'DEB1T': 'DEBIT',
  'DEB!T': 'DEBIT',
  'CREDIT': 'CREDIT',
  'CRED1T': 'CREDIT',
  'CRED!T': 'CREDIT',
  'BALANCE': 'BALANCE',
  'BA1ANCE': 'BALANCE',
  'BALANGE': 'BALANCE',
  'DATE': 'DATE',
  'OATE': 'DATE',
  'DESCRIPTION': 'DESCRIPTION',
  'DESCR1PT1ON': 'DESCRIPTION',
  'PARTICULARS': 'PARTICULARS',
  'PART1CULARS': 'PARTICULARS',
  'WITHDRAWAL': 'WITHDRAWAL',
  'W1THDRAWAL': 'WITHDRAWAL',
  'DEPOSIT': 'DEPOSIT',
  'DEPOS1T': 'DEPOSIT',
  'OPENING': 'OPENING',
  'OPEN1NG': 'OPENING',
  'CLOSING': 'CLOSING',
  'CLOS1NG': 'CLOSING',
  'TRANSFER': 'TRANSFER',
  'TRANSF3R': 'TRANSFER',
  'PAYMENT': 'PAYMENT',
  'PAYM3NT': 'PAYMENT',
};

/**
 * Check if a string is likely a number
 */
function isLikelyNumber(str: string): boolean {
  // Remove common separators and currency symbols
  const cleaned = str.replace(/[\s,.$€£¥₹\-+()]/g, '');
  // Check if mostly digits (allowing for some OCR errors)
  const digitCount = (cleaned.match(/[0-9]/g) || []).length;
  const letterCount = (cleaned.match(/[A-Za-z]/g) || []).length;
  return cleaned.length > 0 && digitCount >= letterCount;
}

/**
 * Correct OCR errors in a numeric string
 */
export function correctOCRNumber(raw: string): string {
  if (!isLikelyNumber(raw)) return raw;
  
  let result = raw;
  
  // Preserve separators and apply character corrections
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    
    // Skip if already a digit or common separator
    if (/[0-9.,\-+\s()]/.test(char)) continue;
    
    // Apply correction if available
    if (NUMERIC_CORRECTIONS[char]) {
      result = result.slice(0, i) + NUMERIC_CORRECTIONS[char] + result.slice(i + 1);
    }
  }
  
  return result;
}

/**
 * Correct OCR errors in currency symbols
 */
export function correctCurrencySymbol(raw: string): string {
  for (const [wrong, correct] of Object.entries(CURRENCY_CORRECTIONS)) {
    if (raw.includes(wrong)) {
      raw = raw.replace(new RegExp(escapeRegex(wrong), 'g'), correct);
    }
  }
  return raw;
}

/**
 * Correct common word OCR errors
 */
export function correctOCRWord(raw: string): string {
  const upper = raw.toUpperCase();
  
  // Direct match
  if (WORD_CORRECTIONS[upper]) {
    // Preserve original case pattern
    if (raw === raw.toLowerCase()) {
      return WORD_CORRECTIONS[upper].toLowerCase();
    }
    if (raw === raw.toUpperCase()) {
      return WORD_CORRECTIONS[upper];
    }
    // Title case
    return WORD_CORRECTIONS[upper].charAt(0) + WORD_CORRECTIONS[upper].slice(1).toLowerCase();
  }
  
  // Fuzzy match for headers
  for (const [wrong, correct] of Object.entries(WORD_CORRECTIONS)) {
    if (levenshteinDistance(upper, wrong) <= 2) {
      return correct;
    }
  }
  
  return raw;
}

/**
 * Apply all OCR corrections to a text element
 */
export function correctTextElement(element: TextElement): TextElement {
  let text = element.text;
  
  // Apply word correction for short strings (likely headers)
  if (text.length <= 15 && !/\d/.test(text)) {
    text = correctOCRWord(text);
  }
  
  // Apply number correction for numeric strings
  if (isLikelyNumber(text)) {
    text = correctCurrencySymbol(text);
    text = correctOCRNumber(text);
  }
  
  return {
    ...element,
    text,
  };
}

/**
 * Apply corrections to all OCR-sourced elements
 */
export function correctOCRElements(elements: TextElement[]): TextElement[] {
  return elements.map((el) => {
    // Only correct OCR-sourced elements
    if (el.source !== 'ocr') return el;
    return correctTextElement(el);
  });
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate corrected number format
 */
export function isValidCorrectedNumber(text: string): boolean {
  // After corrections, should be parseable as a number
  const cleaned = text.replace(/[\s,$€£¥₹()]/g, '').replace(/,/g, '');
  return !isNaN(parseFloat(cleaned));
}

/**
 * Get confidence boost for corrected elements
 * Returns a multiplier to apply to the original confidence
 */
export function getConfidenceBoost(original: string, corrected: string): number {
  if (original === corrected) return 1.0;
  
  // Measure how much was changed
  const distance = levenshteinDistance(original, corrected);
  const changeRatio = distance / original.length;
  
  // Small changes boost confidence (corrections worked)
  // Large changes reduce confidence (too much guessing)
  if (changeRatio < 0.1) return 1.1;  // Minor fix, boost
  if (changeRatio < 0.2) return 1.0;  // Moderate fix, neutral
  if (changeRatio < 0.3) return 0.9;  // Significant changes, slight penalty
  return 0.8;  // Major changes, larger penalty
}
