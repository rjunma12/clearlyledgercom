/**
 * Multi-Strategy Table Detection Engine
 * Runs multiple detection strategies in parallel and selects the best result
 * 
 * Strategies:
 * 1. Header-anchored - uses keyword matching
 * 2. Geometry-based gutter detection
 * 3. Column-count heuristic - finds most consistent column count
 * 4. Font-weight detection - uses bold text as anchors
 */

import type { TextElement } from './types';
import type { PdfLine, ColumnBoundary, TableRegion } from './tableDetector';
import { groupWordsIntoLines, detectColumnBoundaries, classifyColumns, detectTableRegions } from './tableDetector';
import { detectAndLockHeaders, anchorsToColumnBoundaries, type HeaderDetectionResult } from './headerAnchors';

// =============================================================================
// TYPES
// =============================================================================

export interface DetectionStrategy {
  name: string;
  priority: number;
  detect: (elements: TextElement[]) => StrategyResult;
}

export interface StrategyResult {
  success: boolean;
  strategyName: string;
  tables: TableRegion[];
  columnBoundaries: ColumnBoundary[];
  headerDetection?: HeaderDetectionResult;
  score: number;
  metrics: StrategyMetrics;
}

export interface StrategyMetrics {
  transactionCount: number;
  hasBalanceColumn: boolean;
  hasDateColumn: boolean;
  datePatternMatches: number;
  balanceValidationScore: number;
  columnCount: number;
}

export interface MultiStrategyResult {
  bestResult: StrategyResult;
  allResults: StrategyResult[];
  strategyUsed: string;
  confidenceImprovement: number;
}

// =============================================================================
// SCORING WEIGHTS
// =============================================================================

const SCORING_WEIGHTS = {
  transactionCount: 0.20,
  hasBalanceColumn: 0.15,
  hasDateColumn: 0.15,
  datePatternMatches: 0.15,
  balanceValidationScore: 0.25,
  columnCount: 0.10,
};

// =============================================================================
// STRATEGY 1: HEADER-ANCHORED DETECTION
// =============================================================================

function headerAnchoredStrategy(elements: TextElement[]): StrategyResult {
  const lines = groupWordsIntoLines(elements);
  
  // Detect header and lock column anchors
  const headerResult = detectAndLockHeaders(lines);
  
  // Convert anchors to column boundaries
  const columnBoundaries = anchorsToColumnBoundaries(headerResult.anchors);
  
  // Detect table regions using header line as starting point
  const dataLines = headerResult.headerLineIndex >= 0 
    ? lines.slice(headerResult.headerLineIndex + 1)
    : lines;
  
  const tables = detectTableRegions(dataLines);
  
  // Enrich tables with column boundaries
  const enrichedTables = tables.map(table => ({
    ...table,
    columnBoundaries: columnBoundaries.length > 0 ? columnBoundaries : table.columnBoundaries,
  }));
  
  const metrics = calculateMetrics(enrichedTables, columnBoundaries);
  
  return {
    success: headerResult.confidence > 0.5 && columnBoundaries.length >= 3,
    strategyName: 'header-anchored',
    tables: enrichedTables,
    columnBoundaries,
    headerDetection: headerResult,
    score: calculateScore(metrics),
    metrics,
  };
}

// =============================================================================
// STRATEGY 2: GEOMETRY-BASED GUTTER DETECTION
// =============================================================================

function geometryGutterStrategy(elements: TextElement[]): StrategyResult {
  const lines = groupWordsIntoLines(elements);
  
  // Skip header detection, go straight to geometry
  const tables = detectTableRegions(lines);
  
  if (tables.length === 0) {
    return {
      success: false,
      strategyName: 'geometry-gutter',
      tables: [],
      columnBoundaries: [],
      score: 0,
      metrics: emptyMetrics(),
    };
  }
  
  // Detect columns from largest table
  const largestTable = tables.reduce((a, b) => 
    a.dataLines.length > b.dataLines.length ? a : b
  );
  
  const columnBoundaries = detectColumnBoundaries(largestTable.dataLines);
  const classifiedBoundaries = classifyColumns(largestTable.dataLines, columnBoundaries);
  
  // Enrich all tables
  const enrichedTables = tables.map(table => ({
    ...table,
    columnBoundaries: classifiedBoundaries,
  }));
  
  const metrics = calculateMetrics(enrichedTables, classifiedBoundaries);
  
  return {
    success: classifiedBoundaries.length >= 3,
    strategyName: 'geometry-gutter',
    tables: enrichedTables,
    columnBoundaries: classifiedBoundaries,
    score: calculateScore(metrics),
    metrics,
  };
}

// =============================================================================
// STRATEGY 3: COLUMN-COUNT HEURISTIC
// =============================================================================

function columnCountStrategy(elements: TextElement[]): StrategyResult {
  const lines = groupWordsIntoLines(elements);
  
  // Analyze column count distribution
  const columnCounts: Record<number, number> = {};
  for (const line of lines) {
    const count = line.words.length;
    if (count >= 3 && count <= 10) {
      columnCounts[count] = (columnCounts[count] || 0) + 1;
    }
  }
  
  // Find most common column count
  let mostCommonCount = 0;
  let highestFrequency = 0;
  for (const [count, freq] of Object.entries(columnCounts)) {
    if (freq > highestFrequency) {
      highestFrequency = freq;
      mostCommonCount = parseInt(count);
    }
  }
  
  if (mostCommonCount === 0) {
    return {
      success: false,
      strategyName: 'column-count',
      tables: [],
      columnBoundaries: [],
      score: 0,
      metrics: emptyMetrics(),
    };
  }
  
  // Filter lines to only those with the target column count (±1)
  const targetLines = lines.filter(line => 
    Math.abs(line.words.length - mostCommonCount) <= 1
  );
  
  // Detect columns from filtered lines
  const columnBoundaries = detectColumnBoundaries(targetLines);
  const classifiedBoundaries = classifyColumns(targetLines, columnBoundaries);
  
  // Create synthetic table region
  const tables: TableRegion[] = targetLines.length > 0 ? [{
    top: Math.min(...targetLines.map(l => l.top)),
    bottom: Math.max(...targetLines.map(l => l.bottom)),
    left: Math.min(...targetLines.map(l => l.left)),
    right: Math.max(...targetLines.map(l => l.right)),
    headerLine: targetLines[0] || null,
    dataLines: targetLines,
    columnBoundaries: classifiedBoundaries,
    pageNumbers: [...new Set(targetLines.map(l => l.pageNumber))],
  }] : [];
  
  const metrics = calculateMetrics(tables, classifiedBoundaries);
  
  return {
    success: classifiedBoundaries.length >= 3,
    strategyName: 'column-count',
    tables,
    columnBoundaries: classifiedBoundaries,
    score: calculateScore(metrics),
    metrics,
  };
}

// =============================================================================
// STRATEGY 4: FONT-WEIGHT ANCHORING
// =============================================================================

function fontWeightStrategy(elements: TextElement[]): StrategyResult {
  const lines = groupWordsIntoLines(elements);
  
  // Find lines with bold text (potential headers)
  const boldLines = lines.filter(line => 
    line.words.some(word => {
      // Check if the original element had font info
      const originalElement = elements.find(el => 
        el.text.trim() === word.text && 
        Math.abs(el.boundingBox.x - word.x0) < 5
      );
      return originalElement?.fontInfo?.isBold === true;
    })
  );
  
  // If we found bold lines in the first 15 lines, use the first as header
  const potentialHeaders = boldLines.filter((_, idx) => idx < 5);
  
  if (potentialHeaders.length === 0) {
    // Fall back to geometry strategy
    return geometryGutterStrategy(elements);
  }
  
  const headerLine = potentialHeaders[0];
  const headerLineIndex = lines.indexOf(headerLine);
  
  // Get data lines after header
  const dataLines = lines.slice(headerLineIndex + 1);
  
  // Detect columns
  const columnBoundaries = detectColumnBoundaries([headerLine, ...dataLines.slice(0, 50)]);
  const classifiedBoundaries = classifyColumns([headerLine, ...dataLines.slice(0, 50)], columnBoundaries);
  
  // Build table region
  const tables: TableRegion[] = dataLines.length > 0 ? [{
    top: headerLine.top,
    bottom: Math.max(...dataLines.map(l => l.bottom), headerLine.bottom),
    left: Math.min(...dataLines.map(l => l.left), headerLine.left),
    right: Math.max(...dataLines.map(l => l.right), headerLine.right),
    headerLine,
    dataLines,
    columnBoundaries: classifiedBoundaries,
    pageNumbers: [...new Set([headerLine.pageNumber, ...dataLines.map(l => l.pageNumber)])],
  }] : [];
  
  const metrics = calculateMetrics(tables, classifiedBoundaries);
  
  return {
    success: classifiedBoundaries.length >= 3,
    strategyName: 'font-weight',
    tables,
    columnBoundaries: classifiedBoundaries,
    score: calculateScore(metrics) * 1.1, // Slight boost for font-based detection
    metrics,
  };
}

// =============================================================================
// SCORING & SELECTION
// =============================================================================

function calculateMetrics(tables: TableRegion[], boundaries: ColumnBoundary[]): StrategyMetrics {
  const totalLines = tables.reduce((sum, t) => sum + t.dataLines.length, 0);
  
  const hasBalanceColumn = boundaries.some(b => b.inferredType === 'balance');
  const hasDateColumn = boundaries.some(b => b.inferredType === 'date');
  
  // Count date pattern matches in data
  let dateMatches = 0;
  for (const table of tables) {
    for (const line of table.dataLines) {
      const firstWord = line.words[0]?.text || '';
      if (/^\d{1,2}[\/\-\.]\d{1,2}/.test(firstWord) || 
          /^\d{1,2}\s+[A-Za-z]{3}/.test(firstWord)) {
        dateMatches++;
      }
    }
  }
  
  // Simplified balance validation score (0-100)
  // In real implementation, this would do a dry-run balance check
  const balanceValidationScore = hasBalanceColumn ? 70 : 30;
  
  return {
    transactionCount: totalLines,
    hasBalanceColumn,
    hasDateColumn,
    datePatternMatches: dateMatches,
    balanceValidationScore,
    columnCount: boundaries.length,
  };
}

function calculateScore(metrics: StrategyMetrics): number {
  let score = 0;
  
  // Transaction count (normalized to 0-100)
  score += Math.min(metrics.transactionCount / 2, 100) * SCORING_WEIGHTS.transactionCount;
  
  // Balance column presence
  score += (metrics.hasBalanceColumn ? 100 : 0) * SCORING_WEIGHTS.hasBalanceColumn;
  
  // Date column presence
  score += (metrics.hasDateColumn ? 100 : 0) * SCORING_WEIGHTS.hasDateColumn;
  
  // Date pattern matches (normalized)
  const dateMatchRatio = metrics.transactionCount > 0 
    ? metrics.datePatternMatches / metrics.transactionCount 
    : 0;
  score += (dateMatchRatio * 100) * SCORING_WEIGHTS.datePatternMatches;
  
  // Balance validation score
  score += metrics.balanceValidationScore * SCORING_WEIGHTS.balanceValidationScore;
  
  // Column count (optimal is 4-5)
  const columnScore = metrics.columnCount >= 4 && metrics.columnCount <= 6 ? 100 :
                      metrics.columnCount >= 3 ? 70 : 30;
  score += columnScore * SCORING_WEIGHTS.columnCount;
  
  return score;
}

function emptyMetrics(): StrategyMetrics {
  return {
    transactionCount: 0,
    hasBalanceColumn: false,
    hasDateColumn: false,
    datePatternMatches: 0,
    balanceValidationScore: 0,
    columnCount: 0,
  };
}

// =============================================================================
// MAIN MULTI-STRATEGY DETECTOR
// =============================================================================

/**
 * Run all detection strategies and select the best result
 * Strategies are run in parallel conceptually (sequentially in JS)
 * The winner is selected based on scoring
 */
export function runMultiStrategyDetection(elements: TextElement[]): MultiStrategyResult {
  console.log('[MultiStrategy] Starting multi-strategy table detection...');
  
  const strategies: DetectionStrategy[] = [
    { name: 'header-anchored', priority: 1, detect: headerAnchoredStrategy },
    { name: 'geometry-gutter', priority: 2, detect: geometryGutterStrategy },
    { name: 'column-count', priority: 3, detect: columnCountStrategy },
    { name: 'font-weight', priority: 4, detect: fontWeightStrategy },
  ];
  
  // Run all strategies
  const results: StrategyResult[] = [];
  
  for (const strategy of strategies) {
    try {
      const result = strategy.detect(elements);
      results.push(result);
      console.log(`[MultiStrategy] ${strategy.name}: success=${result.success}, score=${result.score.toFixed(1)}, txCount=${result.metrics.transactionCount}`);
    } catch (error) {
      console.error(`[MultiStrategy] ${strategy.name} failed:`, error);
      results.push({
        success: false,
        strategyName: strategy.name,
        tables: [],
        columnBoundaries: [],
        score: 0,
        metrics: emptyMetrics(),
      });
    }
  }
  
  // Select best result
  const successfulResults = results.filter(r => r.success);
  
  let bestResult: StrategyResult;
  if (successfulResults.length > 0) {
    // Sort by score descending
    successfulResults.sort((a, b) => b.score - a.score);
    bestResult = successfulResults[0];
  } else {
    // Fall back to highest scoring even if not successful
    results.sort((a, b) => b.score - a.score);
    bestResult = results[0];
  }
  
  // Calculate confidence improvement vs single strategy
  const singleStrategyScore = results.find(r => r.strategyName === 'geometry-gutter')?.score || 0;
  const confidenceImprovement = singleStrategyScore > 0 
    ? ((bestResult.score - singleStrategyScore) / singleStrategyScore) * 100
    : 0;
  
  console.log(`[MultiStrategy] Best strategy: ${bestResult.strategyName} (score: ${bestResult.score.toFixed(1)})`);
  
  return {
    bestResult,
    allResults: results,
    strategyUsed: bestResult.strategyName,
    confidenceImprovement,
  };
}

/**
 * Quick check to determine if multi-strategy is likely beneficial
 * Returns true if document appears complex or initial detection was poor
 */
export function shouldUseMultiStrategy(elements: TextElement[]): boolean {
  const lines = groupWordsIntoLines(elements);
  
  // Check if header detection is weak
  const headerResult = detectAndLockHeaders(lines);
  if (headerResult.confidence < 0.7) {
    return true;
  }
  
  // Check for multiple potential table regions
  const tables = detectTableRegions(lines);
  if (tables.length > 1) {
    return true;
  }
  
  // Check for inconsistent column structure
  if (lines.length > 0) {
    const columnCounts = lines.slice(0, 20).map(l => l.words.length);
    const variance = calculateVariance(columnCounts);
    if (variance > 4) {
      return true;
    }
  }
  
  return false;
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => (v - mean) ** 2);
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}
