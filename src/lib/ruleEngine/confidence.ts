/**
 * Pipeline Confidence Scoring
 * Tracks quality metrics throughout the parsing pipeline
 */

import type { ParsedTransaction, ParsedDocument } from './types';

// =============================================================================
// CONFIDENCE TYPES
// =============================================================================

export interface StageConfidence {
  /** Stage name */
  stage: string;
  /** Confidence score (0-100) */
  score: number;
  /** Number of successful operations */
  successes: number;
  /** Total operations attempted */
  total: number;
  /** Optional details/notes */
  notes?: string;
}

export interface PipelineConfidence {
  /** Overall confidence (0-100) */
  overall: number;
  /** Quality grade */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Individual stage scores */
  stages: StageConfidence[];
  /** Specific metric breakdowns */
  metrics: {
    bankDetection: number;
    columnDetection: number;
    dateExtraction: number;
    amountExtraction: number;
    balanceValidation: number;
    ocrQuality?: number;
  };
  /** Flags and warnings */
  flags: string[];
  /** Recommendations for improvement */
  recommendations: string[];
}

// =============================================================================
// CONFIDENCE BUILDER
// =============================================================================

export class ConfidenceBuilder {
  private stages: StageConfidence[] = [];
  private flags: string[] = [];
  private recommendations: string[] = [];
  
  private bankDetectionScore: number = 0;
  private columnDetectionScore: number = 0;
  private dateExtractionScore: number = 0;
  private amountExtractionScore: number = 0;
  private balanceValidationScore: number = 0;
  private ocrQualityScore?: number;
  
  /**
   * Record bank detection result
   */
  setBankDetection(confidence: number, matchType: 'exact' | 'fuzzy' | 'fallback'): this {
    this.bankDetectionScore = confidence * 100;
    
    if (matchType === 'fallback') {
      this.flags.push('Unknown bank - using generic parsing rules');
      this.recommendations.push('Consider adding a bank profile for better accuracy');
    } else if (matchType === 'fuzzy') {
      this.flags.push('Bank detected with medium confidence');
    }
    
    this.stages.push({
      stage: 'Bank Detection',
      score: this.bankDetectionScore,
      successes: matchType !== 'fallback' ? 1 : 0,
      total: 1,
      notes: `Match type: ${matchType}`,
    });
    
    return this;
  }
  
  /**
   * Record column detection result
   */
  setColumnDetection(columnsFound: number, expectedColumns: number, method: string): this {
    this.columnDetectionScore = Math.min((columnsFound / expectedColumns) * 100, 100);
    
    if (columnsFound < expectedColumns) {
      this.flags.push(`Only ${columnsFound} of ${expectedColumns} columns detected`);
      this.recommendations.push('Check if document has clear column headers');
    }
    
    if (method === 'fallback') {
      this.flags.push('Used fallback column detection');
      this.recommendations.push('Headers may be unclear - review column assignments');
    }
    
    this.stages.push({
      stage: 'Column Detection',
      score: this.columnDetectionScore,
      successes: columnsFound,
      total: expectedColumns,
      notes: `Method: ${method}`,
    });
    
    return this;
  }
  
  /**
   * Record date extraction results
   */
  setDateExtraction(parsed: number, total: number): this {
    this.dateExtractionScore = total > 0 ? (parsed / total) * 100 : 0;
    
    if (this.dateExtractionScore < 90) {
      this.flags.push(`${total - parsed} dates could not be parsed`);
      this.recommendations.push('Check date format compatibility');
    }
    
    this.stages.push({
      stage: 'Date Extraction',
      score: this.dateExtractionScore,
      successes: parsed,
      total,
    });
    
    return this;
  }
  
  /**
   * Record amount extraction results
   */
  setAmountExtraction(parsed: number, total: number): this {
    this.amountExtractionScore = total > 0 ? (parsed / total) * 100 : 0;
    
    if (this.amountExtractionScore < 95) {
      this.flags.push(`${total - parsed} amounts could not be parsed`);
      this.recommendations.push('Review number format settings');
    }
    
    this.stages.push({
      stage: 'Amount Extraction',
      score: this.amountExtractionScore,
      successes: parsed,
      total,
    });
    
    return this;
  }
  
  /**
   * Record balance validation results
   */
  setBalanceValidation(valid: number, errors: number, warnings: number): this {
    const total = valid + errors + warnings;
    this.balanceValidationScore = total > 0 ? (valid / total) * 100 : 0;
    
    if (errors > 0) {
      this.flags.push(`${errors} balance validation errors detected`);
      this.recommendations.push('Review transactions with balance mismatches');
    }
    
    if (warnings > 0) {
      this.flags.push(`${warnings} balance warnings (possible debit/credit swaps)`);
    }
    
    this.stages.push({
      stage: 'Balance Validation',
      score: this.balanceValidationScore,
      successes: valid,
      total,
      notes: errors > 0 ? `${errors} errors, ${warnings} warnings` : undefined,
    });
    
    return this;
  }
  
  /**
   * Record OCR quality (if OCR was used)
   */
  setOCRQuality(averageConfidence: number, lowConfidenceCount: number): this {
    this.ocrQualityScore = averageConfidence * 100;
    
    if (averageConfidence < 0.8) {
      this.flags.push('Low OCR confidence detected');
      this.recommendations.push('Consider using a higher quality scan');
    }
    
    if (lowConfidenceCount > 0) {
      this.flags.push(`${lowConfidenceCount} low-confidence text regions`);
    }
    
    this.stages.push({
      stage: 'OCR Quality',
      score: this.ocrQualityScore,
      successes: Math.round(averageConfidence * 100),
      total: 100,
      notes: `${lowConfidenceCount} low-confidence regions`,
    });
    
    return this;
  }
  
  /**
   * Add a custom flag
   */
  addFlag(flag: string): this {
    this.flags.push(flag);
    return this;
  }
  
  /**
   * Add a recommendation
   */
  addRecommendation(recommendation: string): this {
    this.recommendations.push(recommendation);
    return this;
  }
  
  /**
   * Calculate overall score and build result
   */
  build(): PipelineConfidence {
    // Weight each metric
    const weights = {
      bankDetection: 0.1,
      columnDetection: 0.2,
      dateExtraction: 0.15,
      amountExtraction: 0.25,
      balanceValidation: 0.3,
    };
    
    let overall = 
      this.bankDetectionScore * weights.bankDetection +
      this.columnDetectionScore * weights.columnDetection +
      this.dateExtractionScore * weights.dateExtraction +
      this.amountExtractionScore * weights.amountExtraction +
      this.balanceValidationScore * weights.balanceValidation;
    
    // If OCR was used, factor it in
    if (this.ocrQualityScore !== undefined) {
      overall = overall * 0.9 + this.ocrQualityScore * 0.1;
    }
    
    // Determine grade
    const grade = this.calculateGrade(overall);
    
    return {
      overall: Math.round(overall),
      grade,
      stages: this.stages,
      metrics: {
        bankDetection: Math.round(this.bankDetectionScore),
        columnDetection: Math.round(this.columnDetectionScore),
        dateExtraction: Math.round(this.dateExtractionScore),
        amountExtraction: Math.round(this.amountExtractionScore),
        balanceValidation: Math.round(this.balanceValidationScore),
        ocrQuality: this.ocrQualityScore !== undefined 
          ? Math.round(this.ocrQualityScore) 
          : undefined,
      },
      flags: [...new Set(this.flags)], // Dedupe
      recommendations: [...new Set(this.recommendations)],
    };
  }
  
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A';
    if (score >= 85) return 'B';
    if (score >= 70) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
}

// =============================================================================
// CONFIDENCE FROM DOCUMENT
// =============================================================================

/**
 * Calculate confidence from a parsed document
 */
export function calculateDocumentConfidence(
  document: ParsedDocument,
  bankMatchType: 'exact' | 'fuzzy' | 'fallback' = 'fallback',
  bankConfidence: number = 0,
  columnMethod: string = 'headers'
): PipelineConfidence {
  const builder = new ConfidenceBuilder();
  
  // Bank detection
  builder.setBankDetection(bankConfidence, bankMatchType);
  
  // Column detection (estimate from data quality)
  const columnsExpected = 5; // date, desc, debit, credit, balance
  const columnsFound = estimateColumnsFound(document);
  builder.setColumnDetection(columnsFound, columnsExpected, columnMethod);
  
  // Date extraction
  const transactions = document.segments.flatMap(s => s.transactions);
  const datesTotal = transactions.length;
  const datesParsed = transactions.filter(t => t.date && t.date.length > 0).length;
  builder.setDateExtraction(datesParsed, datesTotal);
  
  // Amount extraction
  const amountsTotal = transactions.length * 2; // Debit + Credit
  const amountsParsed = transactions.filter(t => 
    t.debit !== null || t.credit !== null
  ).length * 2;
  builder.setAmountExtraction(amountsParsed, amountsTotal);
  
  // Balance validation
  builder.setBalanceValidation(
    document.validTransactions,
    document.errorTransactions,
    document.warningTransactions
  );
  
  return builder.build();
}

/**
 * Estimate how many columns were found based on data
 */
function estimateColumnsFound(document: ParsedDocument): number {
  const transactions = document.segments.flatMap(s => s.transactions);
  if (transactions.length === 0) return 0;
  
  let columns = 0;
  
  // Check if we have dates
  if (transactions.some(t => t.date && t.date.length > 0)) columns++;
  
  // Check if we have descriptions
  if (transactions.some(t => t.description && t.description.length > 0)) columns++;
  
  // Check if we have debits
  if (transactions.some(t => t.debit !== null)) columns++;
  
  // Check if we have credits
  if (transactions.some(t => t.credit !== null)) columns++;
  
  // Check if we have balances
  if (transactions.some(t => t.balance !== undefined)) columns++;
  
  return columns;
}

// =============================================================================
// CONFIDENCE DISPLAY HELPERS
// =============================================================================

/**
 * Get color for confidence score
 */
export function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get background color for confidence grade
 */
export function getGradeBackground(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800';
    case 'B': return 'bg-blue-100 text-blue-800';
    case 'C': return 'bg-yellow-100 text-yellow-800';
    case 'D': return 'bg-orange-100 text-orange-800';
    case 'F': return 'bg-red-100 text-red-800';
  }
}

/**
 * Get description for confidence grade
 */
export function getGradeDescription(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (grade) {
    case 'A': return 'Excellent - High confidence in accuracy';
    case 'B': return 'Good - Minor issues may exist';
    case 'C': return 'Fair - Review recommended';
    case 'D': return 'Poor - Manual review required';
    case 'F': return 'Failed - Significant errors detected';
  }
}
