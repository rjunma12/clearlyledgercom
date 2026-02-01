/**
 * Pattern Learner
 * Logs and analyzes unmatched patterns for future profile improvements
 * Helps identify recurring parsing failures
 */

// =============================================================================
// TYPES
// =============================================================================

export type PatternType = 'date' | 'amount' | 'header' | 'reference' | 'currency';

export interface UnmatchedPattern {
  type: PatternType;
  rawText: string;
  context: string;              // Surrounding text for context
  frequency: number;
  firstSeen: string;            // ISO timestamp
  lastSeen: string;             // ISO timestamp
  suggestedPattern?: string;    // AI-generated regex suggestion
  pageNumbers: number[];
}

export interface PatternSummary {
  totalUnmatched: number;
  byType: Record<PatternType, number>;
  topPatterns: UnmatchedPattern[];
  suggestions: string[];
}

// =============================================================================
// PATTERN LEARNER CLASS
// =============================================================================

/**
 * PatternLearner collects and analyzes unmatched patterns during parsing
 * Instance should be created per-document processing
 */
export class PatternLearner {
  private unmatchedPatterns: Map<string, UnmatchedPattern> = new Map();
  private enabled: boolean = true;
  
  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }
  
  /**
   * Generate a unique key for pattern deduplication
   */
  private getPatternKey(type: PatternType, rawText: string): string {
    // Normalize the text for better grouping
    const normalized = rawText.trim().toLowerCase().replace(/\s+/g, ' ');
    return `${type}:${normalized}`;
  }
  
  /**
   * Record an unmatched date pattern
   */
  recordUnmatchedDate(text: string, context: string, pageNumber: number): void {
    if (!this.enabled || !text) return;
    this.recordPattern('date', text, context, pageNumber);
  }
  
  /**
   * Record an unmatched amount pattern
   */
  recordUnmatchedAmount(text: string, context: string, pageNumber: number): void {
    if (!this.enabled || !text) return;
    this.recordPattern('amount', text, context, pageNumber);
  }
  
  /**
   * Record an unmatched header pattern
   */
  recordUnmatchedHeader(text: string, context: string, pageNumber: number): void {
    if (!this.enabled || !text) return;
    this.recordPattern('header', text, context, pageNumber);
  }
  
  /**
   * Record an unmatched reference pattern
   */
  recordUnmatchedReference(text: string, context: string, pageNumber: number): void {
    if (!this.enabled || !text) return;
    this.recordPattern('reference', text, context, pageNumber);
  }
  
  /**
   * Record an unmatched currency pattern
   */
  recordUnmatchedCurrency(text: string, context: string, pageNumber: number): void {
    if (!this.enabled || !text) return;
    this.recordPattern('currency', text, context, pageNumber);
  }
  
  /**
   * Internal method to record a pattern
   */
  private recordPattern(type: PatternType, rawText: string, context: string, pageNumber: number): void {
    const key = this.getPatternKey(type, rawText);
    const now = new Date().toISOString();
    
    const existing = this.unmatchedPatterns.get(key);
    
    if (existing) {
      // Update existing pattern
      existing.frequency++;
      existing.lastSeen = now;
      if (!existing.pageNumbers.includes(pageNumber)) {
        existing.pageNumbers.push(pageNumber);
      }
      // Update context if current one is longer/more informative
      if (context.length > existing.context.length) {
        existing.context = context.slice(0, 200); // Limit context length
      }
    } else {
      // Create new pattern entry
      this.unmatchedPatterns.set(key, {
        type,
        rawText: rawText.slice(0, 100), // Limit raw text length
        context: context.slice(0, 200),
        frequency: 1,
        firstSeen: now,
        lastSeen: now,
        pageNumbers: [pageNumber],
      });
    }
  }
  
  /**
   * Get patterns that appear frequently (threshold: 3+ times)
   */
  getSuggestions(frequencyThreshold: number = 3): UnmatchedPattern[] {
    return Array.from(this.unmatchedPatterns.values())
      .filter(p => p.frequency >= frequencyThreshold)
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Get all recorded patterns
   */
  getAllPatterns(): UnmatchedPattern[] {
    return Array.from(this.unmatchedPatterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Get patterns by type
   */
  getPatternsByType(type: PatternType): UnmatchedPattern[] {
    return this.getAllPatterns().filter(p => p.type === type);
  }
  
  /**
   * Get summary of all unmatched patterns
   */
  getSummary(): PatternSummary {
    const patterns = this.getAllPatterns();
    const suggestions: string[] = [];
    
    // Count by type
    const byType: Record<PatternType, number> = {
      date: 0,
      amount: 0,
      header: 0,
      reference: 0,
      currency: 0,
    };
    
    for (const pattern of patterns) {
      byType[pattern.type]++;
    }
    
    // Generate suggestions based on patterns
    const frequentPatterns = this.getSuggestions(3);
    
    for (const pattern of frequentPatterns.slice(0, 5)) {
      switch (pattern.type) {
        case 'date':
          suggestions.push(
            `Date pattern "${pattern.rawText}" appeared ${pattern.frequency} times. Consider adding to DATE_PATTERNS.`
          );
          break;
        case 'amount':
          suggestions.push(
            `Amount format "${pattern.rawText}" not recognized ${pattern.frequency} times. May need new number format.`
          );
          break;
        case 'header':
          suggestions.push(
            `Header "${pattern.rawText}" not matched ${pattern.frequency} times. Consider adding to HEADER_KEYWORDS.`
          );
          break;
        case 'reference':
          suggestions.push(
            `Reference format "${pattern.rawText}" appeared ${pattern.frequency} times. Consider adding to REFERENCE_PATTERNS.`
          );
          break;
        case 'currency':
          suggestions.push(
            `Currency symbol "${pattern.rawText}" not recognized ${pattern.frequency} times.`
          );
          break;
      }
    }
    
    return {
      totalUnmatched: patterns.length,
      byType,
      topPatterns: frequentPatterns.slice(0, 10),
      suggestions,
    };
  }
  
  /**
   * Check if there are significant unmatched patterns
   */
  hasSignificantIssues(threshold: number = 5): boolean {
    return this.getSuggestions(3).length >= threshold;
  }
  
  /**
   * Generate warning messages for unmatched patterns
   */
  getWarningMessages(): string[] {
    const warnings: string[] = [];
    const suggestions = this.getSuggestions(3);
    
    if (suggestions.length > 0) {
      warnings.push(
        `${suggestions.length} unrecognized patterns detected - some data may be incomplete`
      );
      
      // Group by type
      const datePatterns = suggestions.filter(p => p.type === 'date');
      const amountPatterns = suggestions.filter(p => p.type === 'amount');
      
      if (datePatterns.length > 0) {
        warnings.push(
          `${datePatterns.length} date format(s) not recognized: "${datePatterns[0].rawText}"...`
        );
      }
      
      if (amountPatterns.length > 0) {
        warnings.push(
          `${amountPatterns.length} amount format(s) not recognized: "${amountPatterns[0].rawText}"...`
        );
      }
    }
    
    return warnings;
  }
  
  /**
   * Clear all recorded patterns
   */
  clear(): void {
    this.unmatchedPatterns.clear();
  }
  
  /**
   * Export patterns for logging/debugging
   */
  export(): object {
    return {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      allPatterns: this.getAllPatterns(),
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE (for per-processing access)
// =============================================================================

let globalLearner: PatternLearner | null = null;

/**
 * Get or create the global pattern learner instance
 */
export function getPatternLearner(): PatternLearner {
  if (!globalLearner) {
    globalLearner = new PatternLearner();
  }
  return globalLearner;
}

/**
 * Create a new pattern learner instance (for fresh document processing)
 */
export function createPatternLearner(enabled: boolean = true): PatternLearner {
  return new PatternLearner(enabled);
}

/**
 * Reset the global pattern learner
 */
export function resetPatternLearner(): void {
  globalLearner = null;
}
