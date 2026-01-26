/**
 * Value Provenance Tracking
 * Ensures every output value maps directly to extracted source text
 * NEVER fabricate data - leave cell empty if value cannot be traced
 */

import type { BoundingBox } from './types';

// =============================================================================
// PROVENANCE TYPES
// =============================================================================

export interface ValueProvenance {
  /** The parsed/processed value */
  value: unknown;
  /** Original extracted text from PDF */
  sourceText: string;
  /** Page number where text was found */
  sourcePageNumber: number;
  /** Bounding box coordinates in PDF */
  sourceBoundingBox: BoundingBox;
  /** List of transformations applied (e.g., ['trimmed', 'parsed_number']) */
  transformations: string[];
  /** Confidence in the extraction (0-1) */
  confidence: number;
}

export interface TrackedValue<T = string | number | null> {
  value: T;
  provenance: ValueProvenance | null;
  isVerified: boolean;
}

// =============================================================================
// PROVENANCE CREATION
// =============================================================================

/**
 * Create a provenance record for a value
 * Returns null if source text is empty or invalid
 */
export function createProvenance(
  rawValue: string | undefined | null,
  sourceInfo: {
    pageNumber: number;
    boundingBox: BoundingBox;
  },
  transformations: string[] = []
): ValueProvenance | null {
  if (!rawValue || rawValue.trim() === '') {
    return null;
  }

  return {
    value: rawValue.trim(),
    sourceText: rawValue,
    sourcePageNumber: sourceInfo.pageNumber,
    sourceBoundingBox: sourceInfo.boundingBox,
    transformations,
    confidence: 1.0,
  };
}

/**
 * Parse a value with provenance tracking
 * Returns null if parsing fails - NEVER fabricates data
 */
export function parseWithProvenance<T>(
  rawValue: string | undefined | null,
  parser: (s: string) => T | null,
  sourceInfo: {
    pageNumber: number;
    boundingBox: BoundingBox;
  },
  transformationType: string = 'parsed'
): TrackedValue<T | null> {
  // Empty input = empty output (not fabricated)
  if (!rawValue || rawValue.trim() === '') {
    return {
      value: null,
      provenance: null,
      isVerified: true, // Empty is verified as intentionally empty
    };
  }

  const parsed = parser(rawValue.trim());

  // If parsing failed, DO NOT fabricate a value
  if (parsed === null || parsed === undefined || (typeof parsed === 'number' && Number.isNaN(parsed))) {
    console.warn(`[Provenance] Could not parse: "${rawValue}" - leaving empty`);
    return {
      value: null,
      provenance: createProvenance(rawValue, sourceInfo, ['parse_failed']),
      isVerified: false,
    };
  }

  return {
    value: parsed,
    provenance: {
      value: parsed as unknown,
      sourceText: rawValue,
      sourcePageNumber: sourceInfo.pageNumber,
      sourceBoundingBox: sourceInfo.boundingBox,
      transformations: ['trimmed', transformationType],
      confidence: 1.0,
    },
    isVerified: true,
  };
}

// =============================================================================
// PROVENANCE VALIDATION
// =============================================================================

/**
 * Check if a value has valid provenance (can be traced to source)
 */
export function hasValidProvenance(tracked: TrackedValue<unknown>): boolean {
  if (tracked.value === null || tracked.value === '') {
    return true; // Empty values are valid (intentionally empty)
  }
  return tracked.provenance !== null && tracked.isVerified;
}

/**
 * Get provenance summary for audit trail
 */
export function getProvenanceSummary(provenance: ValueProvenance | null): string {
  if (!provenance) return 'No provenance (empty value)';
  
  return `Page ${provenance.sourcePageNumber}: "${provenance.sourceText}" → ${provenance.value} [${provenance.transformations.join(' → ')}]`;
}

// =============================================================================
// FORBIDDEN OPERATIONS (compile-time documentation)
// =============================================================================

/**
 * FORBIDDEN: These operations are NEVER allowed in the pipeline
 * 
 * - guessDateFromContext(): Inferring dates from surrounding content
 * - inferAmountFromBalanceDiff(): Back-calculating amounts from balance changes
 * - computeMissingBalance(): Calculating balances that aren't in the PDF
 * - createSyntheticRow(): Generating transaction rows not in the source
 * - fillMissingValue(): Populating empty cells with guessed values
 * 
 * Correct but incomplete > Complete but wrong
 */
export const FORBIDDEN_OPERATIONS = [
  'guessDateFromContext',
  'inferAmountFromBalanceDiff', 
  'computeMissingBalance',
  'createSyntheticRow',
  'fillMissingValue',
] as const;
