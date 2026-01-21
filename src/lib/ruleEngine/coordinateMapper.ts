/**
 * Coordinate-Anchored Mapping Engine
 * Solves the 'Floating Text' & Column Shift Issue
 */

import type { 
  TextElement, 
  ColumnAnchor, 
  ColumnType, 
  BoundingBox,
  RuleEngineConfig 
} from './types';
import { findCanonicalHeader } from './locales';

// =============================================================================
// COLUMN ANCHOR DETECTION
// =============================================================================

/**
 * Identify anchor keywords and store their X-coordinate bounding boxes
 * This creates a spatial map of where each column exists on the page
 */
export function detectColumnAnchors(
  headerElements: TextElement[]
): ColumnAnchor[] {
  const anchors: ColumnAnchor[] = [];
  
  for (const element of headerElements) {
    const canonicalType = findCanonicalHeader(element.text);
    
    if (canonicalType) {
      anchors.push({
        columnType: canonicalType as ColumnType,
        boundingBox: element.boundingBox,
        aliases: [element.text],
      });
    }
  }
  
  // Sort anchors by X position (left to right, or right to left for RTL)
  anchors.sort((a, b) => a.boundingBox.x - b.boundingBox.x);
  
  return anchors;
}

/**
 * Calculate the horizontal overlap between a text element and a column anchor
 * Returns a value between 0 (no overlap) and 1 (complete overlap)
 */
export function calculateHorizontalOverlap(
  element: BoundingBox,
  anchor: BoundingBox
): number {
  const elementLeft = element.x;
  const elementRight = element.x + element.width;
  const anchorLeft = anchor.x;
  const anchorRight = anchor.x + anchor.width;
  
  // Calculate overlap
  const overlapStart = Math.max(elementLeft, anchorLeft);
  const overlapEnd = Math.min(elementRight, anchorRight);
  const overlapWidth = Math.max(0, overlapEnd - overlapStart);
  
  // Calculate overlap percentage relative to element width
  if (element.width === 0) return 0;
  return overlapWidth / element.width;
}

/**
 * Calculate center-point distance for numerical columns
 * Useful for right-aligned numbers that may extend beyond header bounds
 */
export function calculateCenterDistance(
  element: BoundingBox,
  anchor: BoundingBox
): number {
  const elementCenter = element.x + element.width / 2;
  const anchorCenter = anchor.x + anchor.width / 2;
  return Math.abs(elementCenter - anchorCenter);
}

// =============================================================================
// COLUMN ASSIGNMENT ENGINE
// =============================================================================

/**
 * Assign a text element to a column based on coordinate intersection
 * Uses multiple strategies for robust assignment:
 * 1. Direct overlap (primary)
 * 2. Center-point proximity (for right-aligned numbers)
 * 3. Nearest column (fallback)
 */
export function assignToColumn(
  element: TextElement,
  anchors: ColumnAnchor[],
  config: RuleEngineConfig
): ColumnType | null {
  if (anchors.length === 0) return null;
  
  let bestMatch: ColumnAnchor | null = null;
  let bestScore = 0;
  
  for (const anchor of anchors) {
    // Strategy 1: Calculate horizontal overlap
    const overlap = calculateHorizontalOverlap(element.boundingBox, anchor.boundingBox);
    
    if (overlap >= config.columnOverlapThreshold) {
      if (overlap > bestScore) {
        bestScore = overlap;
        bestMatch = anchor;
      }
    }
  }
  
  // Strategy 2: If no overlap found, check center-point proximity for numerical columns
  if (!bestMatch) {
    const isLikelyNumber = /^[\d\s,.\-()]+$/.test(element.text.trim());
    
    if (isLikelyNumber) {
      let minDistance = Infinity;
      
      for (const anchor of anchors) {
        // Only consider numerical columns
        if (['debit', 'credit', 'balance'].includes(anchor.columnType)) {
          const distance = calculateCenterDistance(element.boundingBox, anchor.boundingBox);
          
          // Use a reasonable threshold (e.g., 1.5x the anchor width)
          if (distance < anchor.boundingBox.width * 1.5 && distance < minDistance) {
            minDistance = distance;
            bestMatch = anchor;
          }
        }
      }
    }
  }
  
  // Strategy 3: Fallback to nearest column
  if (!bestMatch) {
    let minDistance = Infinity;
    
    for (const anchor of anchors) {
      const distance = calculateCenterDistance(element.boundingBox, anchor.boundingBox);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = anchor;
      }
    }
  }
  
  return bestMatch?.columnType ?? null;
}

// =============================================================================
// ROW GROUPING ENGINE
// =============================================================================

export interface TextRow {
  rowIndex: number;
  yPosition: number;
  height: number;
  elements: Map<ColumnType, TextElement[]>;
}

/**
 * Group text elements into rows based on Y-coordinate proximity
 */
export function groupIntoRows(
  elements: TextElement[],
  anchors: ColumnAnchor[],
  config: RuleEngineConfig
): TextRow[] {
  if (elements.length === 0) return [];
  
  // Sort elements by Y position
  const sortedElements = [...elements].sort((a, b) => 
    a.boundingBox.y - b.boundingBox.y
  );
  
  const rows: TextRow[] = [];
  let currentRow: TextRow = {
    rowIndex: 0,
    yPosition: sortedElements[0].boundingBox.y,
    height: sortedElements[0].boundingBox.height,
    elements: new Map(),
  };
  
  for (const element of sortedElements) {
    const yGap = element.boundingBox.y - (currentRow.yPosition + currentRow.height);
    
    // Check if element belongs to a new row
    if (yGap > config.rowGapThreshold) {
      // Save current row if it has content
      if (currentRow.elements.size > 0) {
        rows.push(currentRow);
      }
      
      // Start new row
      currentRow = {
        rowIndex: rows.length,
        yPosition: element.boundingBox.y,
        height: element.boundingBox.height,
        elements: new Map(),
      };
    }
    
    // Assign element to column
    const columnType = assignToColumn(element, anchors, config);
    
    if (columnType) {
      if (!currentRow.elements.has(columnType)) {
        currentRow.elements.set(columnType, []);
      }
      currentRow.elements.get(columnType)!.push(element);
    }
    
    // Update row height if needed
    const elementBottom = element.boundingBox.y + element.boundingBox.height;
    const rowBottom = currentRow.yPosition + currentRow.height;
    if (elementBottom > rowBottom) {
      currentRow.height = elementBottom - currentRow.yPosition;
    }
  }
  
  // Don't forget the last row
  if (currentRow.elements.size > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}

// =============================================================================
// EXTENDED COLUMN BOUNDS
// =============================================================================

/**
 * Extend column anchor bounds based on actual content positions
 * This handles cases where data extends beyond header boundaries
 */
export function extendColumnBounds(
  anchors: ColumnAnchor[],
  rows: TextRow[]
): ColumnAnchor[] {
  const extendedAnchors = anchors.map(anchor => ({
    ...anchor,
    boundingBox: { ...anchor.boundingBox },
  }));
  
  for (const row of rows) {
    for (const [columnType, elements] of row.elements) {
      const anchor = extendedAnchors.find(a => a.columnType === columnType);
      if (!anchor) continue;
      
      for (const element of elements) {
        // Extend left bound
        if (element.boundingBox.x < anchor.boundingBox.x) {
          const extension = anchor.boundingBox.x - element.boundingBox.x;
          anchor.boundingBox.x = element.boundingBox.x;
          anchor.boundingBox.width += extension;
        }
        
        // Extend right bound
        const elementRight = element.boundingBox.x + element.boundingBox.width;
        const anchorRight = anchor.boundingBox.x + anchor.boundingBox.width;
        if (elementRight > anchorRight) {
          anchor.boundingBox.width += elementRight - anchorRight;
        }
      }
    }
  }
  
  return extendedAnchors;
}
