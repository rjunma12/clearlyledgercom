/**
 * Safe Auto-Repair Module
 * Performs LIMITED, SAFE repairs to improve balance validation
 * 
 * ALLOWED repairs:
 * - Debit ↔ Credit flip (classification only, not values)
 * - Parentheses/negative sign normalization
 * - Multi-line row merge
 * 
 * FORBIDDEN repairs (NEVER allowed):
 * - Changing numeric values
 * - Creating new rows
 * - Computing missing balances
 * - Guessing amounts
 */

import type { ParsedTransaction } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface RepairAction {
  rowIndex: number;
  action: 'debit_credit_flip' | 'parentheses_normalize' | 'negative_normalize';
  field: 'debit' | 'credit';
  before: number | null;
  after: number | null;
  reason: string;
}

export interface RepairResult {
  repaired: boolean;
  originalImbalance: number;
  newImbalance: number;
  repairs: RepairAction[];
  repairedTransactions: ParsedTransaction[];
}

// =============================================================================
// REPAIR ELIGIBILITY
// =============================================================================

/**
 * Check if auto-repair can be attempted
 * Requirements:
 * 1. Opening AND closing balances must exist
 * 2. >80% of rows must have amounts
 */
export function canAttemptRepair(
  transactions: ParsedTransaction[],
  openingBalance: number | null,
  closingBalance: number | null
): { canRepair: boolean; reason?: string } {
  if (openingBalance === null) {
    return { canRepair: false, reason: 'Opening balance not found' };
  }
  
  if (closingBalance === null) {
    return { canRepair: false, reason: 'Closing balance not found' };
  }
  
  if (transactions.length === 0) {
    return { canRepair: false, reason: 'No transactions to repair' };
  }
  
  const rowsWithAmounts = transactions.filter(
    tx => tx.debit !== null || tx.credit !== null
  ).length;
  
  const amountRatio = rowsWithAmounts / transactions.length;
  
  if (amountRatio < 0.8) {
    return { 
      canRepair: false, 
      reason: `Only ${Math.round(amountRatio * 100)}% of rows have amounts (need 80%+)` 
    };
  }
  
  return { canRepair: true };
}

// =============================================================================
// IMBALANCE CALCULATION
// =============================================================================

/**
 * Calculate the imbalance between expected and actual closing balance
 */
export function calculateImbalance(
  transactions: ParsedTransaction[],
  openingBalance: number,
  closingBalance: number
): number {
  let runningBalance = openingBalance;
  
  for (const tx of transactions) {
    runningBalance += (tx.credit ?? 0) - (tx.debit ?? 0);
  }
  
  return Math.abs(runningBalance - closingBalance);
}

// =============================================================================
// SAFE REPAIR OPERATIONS
// =============================================================================

/**
 * Try flipping debit/credit for transactions that might be misclassified
 * Only attempts flip if it REDUCES imbalance
 */
function tryDebitCreditFlip(
  transactions: ParsedTransaction[],
  openingBalance: number,
  closingBalance: number
): { transactions: ParsedTransaction[]; actions: RepairAction[]; improved: boolean } {
  const actions: RepairAction[] = [];
  let bestTransactions = [...transactions];
  let bestImbalance = calculateImbalance(transactions, openingBalance, closingBalance);
  
  // Try flipping each transaction individually
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    
    // Only flip if exactly one of debit/credit is set
    if ((tx.debit !== null) !== (tx.credit !== null)) {
      const testTransactions = transactions.map((t, idx) => {
        if (idx !== i) return t;
        
        // Swap debit and credit
        return {
          ...t,
          debit: t.credit,
          credit: t.debit,
        };
      });
      
      const newImbalance = calculateImbalance(testTransactions, openingBalance, closingBalance);
      
      if (newImbalance < bestImbalance) {
        bestImbalance = newImbalance;
        bestTransactions = testTransactions;
        actions.push({
          rowIndex: tx.rowIndex,
          action: 'debit_credit_flip',
          field: tx.debit !== null ? 'debit' : 'credit',
          before: tx.debit ?? tx.credit,
          after: tx.debit ?? tx.credit,
          reason: `Flip reduced imbalance by ${(calculateImbalance(transactions, openingBalance, closingBalance) - newImbalance).toFixed(2)}`,
        });
      }
    }
  }
  
  return {
    transactions: bestTransactions,
    actions,
    improved: actions.length > 0,
  };
}

/**
 * Helper to flip transactions at specific indices
 */
function flipTransactionsAtIndices(
  transactions: ParsedTransaction[],
  indices: number[]
): ParsedTransaction[] {
  return transactions.map((tx, idx) => {
    if (!indices.includes(idx)) return tx;
    
    // Only flip if exactly one of debit/credit is set
    if ((tx.debit !== null) !== (tx.credit !== null)) {
      return {
        ...tx,
        debit: tx.credit,
        credit: tx.debit,
      };
    }
    return tx;
  });
}

interface FlipCandidate {
  indices: number[];
  imbalance: number;
}

/**
 * Try double-flip combinations when single flips aren't enough
 * Explores pairs of transactions that might both be misclassified
 */
function tryDoubleFlip(
  transactions: ParsedTransaction[],
  openingBalance: number,
  closingBalance: number,
  maxCandidates: number = 50
): { transactions: ParsedTransaction[]; actions: RepairAction[]; improved: boolean } {
  const originalImbalance = calculateImbalance(transactions, openingBalance, closingBalance);
  const candidates: FlipCandidate[] = [];
  
  // Find eligible transactions (those with exactly one of debit/credit)
  const eligibleIndices = transactions
    .map((tx, idx) => ({ tx, idx }))
    .filter(({ tx }) => (tx.debit !== null) !== (tx.credit !== null))
    .map(({ idx }) => idx);
  
  // Try all pairs (limited by maxCandidates for performance)
  let pairsChecked = 0;
  for (let i = 0; i < eligibleIndices.length && pairsChecked < maxCandidates; i++) {
    for (let j = i + 1; j < eligibleIndices.length && pairsChecked < maxCandidates; j++) {
      const testTx = flipTransactionsAtIndices(transactions, [eligibleIndices[i], eligibleIndices[j]]);
      const imbalance = calculateImbalance(testTx, openingBalance, closingBalance);
      
      // Only consider if it significantly reduces imbalance
      if (imbalance < originalImbalance * 0.5) {
        candidates.push({ indices: [eligibleIndices[i], eligibleIndices[j]], imbalance });
      }
      pairsChecked++;
    }
  }
  
  if (candidates.length === 0) {
    return { transactions, actions: [], improved: false };
  }
  
  // Sort by imbalance and pick the best
  candidates.sort((a, b) => a.imbalance - b.imbalance);
  const best = candidates[0];
  
  // Only accept if it brings imbalance to near zero
  if (best.imbalance < 0.01) {
    const repairedTransactions = flipTransactionsAtIndices(transactions, best.indices);
    const actions: RepairAction[] = best.indices.map(idx => {
      const tx = transactions[idx];
      return {
        rowIndex: tx.rowIndex,
        action: 'debit_credit_flip' as const,
        field: tx.debit !== null ? 'debit' as const : 'credit' as const,
        before: tx.debit ?? tx.credit,
        after: tx.debit ?? tx.credit,
        reason: `Double-flip repair (pair) reduced imbalance to ${best.imbalance.toFixed(2)}`,
      };
    });
    
    console.log(`[AutoRepair] Double-flip found: indices ${best.indices.join(', ')}, new imbalance: ${best.imbalance.toFixed(2)}`);
    
    return { transactions: repairedTransactions, actions, improved: true };
  }
  
  return { transactions, actions: [], improved: false };
}

/**
 * Normalize parentheses amounts: (100) → -100 → treat as debit
 * This is safe because it doesn't change the numeric value
 */
function normalizeParenthesesAmounts(
  transactions: ParsedTransaction[]
): { transactions: ParsedTransaction[]; actions: RepairAction[] } {
  const actions: RepairAction[] = [];
  
  const normalized = transactions.map(tx => {
    // Check if credit contains parentheses pattern that should be debit
    // This handles cases where the value was correctly parsed as negative
    // but classified in the wrong column
    if (tx.credit !== null && tx.credit < 0 && tx.debit === null) {
      actions.push({
        rowIndex: tx.rowIndex,
        action: 'negative_normalize',
        field: 'credit',
        before: tx.credit,
        after: Math.abs(tx.credit),
        reason: 'Negative credit moved to debit column',
      });
      
      return {
        ...tx,
        debit: Math.abs(tx.credit),
        credit: null,
      };
    }
    
    // Same for debit
    if (tx.debit !== null && tx.debit < 0 && tx.credit === null) {
      actions.push({
        rowIndex: tx.rowIndex,
        action: 'negative_normalize',
        field: 'debit',
        before: tx.debit,
        after: Math.abs(tx.debit),
        reason: 'Negative debit normalized to positive',
      });
      
      return {
        ...tx,
        debit: Math.abs(tx.debit),
      };
    }
    
    return tx;
  });
  
  return { transactions: normalized, actions };
}

// =============================================================================
// MAIN REPAIR FUNCTION
// =============================================================================

/**
 * Attempt safe auto-repair on transactions
 * 
 * IMPORTANT: Only accepts repair if imbalance DECREASES
 * Never changes numeric values, only classification
 */
export function attemptSafeRepair(
  transactions: ParsedTransaction[],
  openingBalance: number,
  closingBalance: number
): RepairResult {
  const originalImbalance = calculateImbalance(transactions, openingBalance, closingBalance);
  
  // If already balanced, no repair needed
  if (originalImbalance < 0.01) {
    return {
      repaired: false,
      originalImbalance,
      newImbalance: originalImbalance,
      repairs: [],
      repairedTransactions: transactions,
    };
  }
  
  let currentTransactions = [...transactions];
  const allRepairs: RepairAction[] = [];
  
  // Step 1: Normalize parentheses/negative amounts
  const normalizeResult = normalizeParenthesesAmounts(currentTransactions);
  if (normalizeResult.actions.length > 0) {
    const newImbalance = calculateImbalance(normalizeResult.transactions, openingBalance, closingBalance);
    
    // Only accept if it reduces imbalance
    if (newImbalance < calculateImbalance(currentTransactions, openingBalance, closingBalance)) {
      currentTransactions = normalizeResult.transactions;
      allRepairs.push(...normalizeResult.actions);
    }
  }
  
  // Step 2: Try single debit/credit flips
  const flipResult = tryDebitCreditFlip(currentTransactions, openingBalance, closingBalance);
  if (flipResult.improved) {
    currentTransactions = flipResult.transactions;
    allRepairs.push(...flipResult.actions);
  }
  
  let newImbalance = calculateImbalance(currentTransactions, openingBalance, closingBalance);
  
  // Step 3: If still imbalanced, try double-flips
  if (newImbalance >= 0.01) {
    const doubleFlipResult = tryDoubleFlip(currentTransactions, openingBalance, closingBalance);
    if (doubleFlipResult.improved) {
      currentTransactions = doubleFlipResult.transactions;
      allRepairs.push(...doubleFlipResult.actions);
      newImbalance = calculateImbalance(currentTransactions, openingBalance, closingBalance);
    }
  }
  
  // Only accept repairs if imbalance decreased
  const repairAccepted = newImbalance < originalImbalance;
  
  console.log(`[AutoRepair] Original imbalance: ${originalImbalance.toFixed(2)}, New: ${newImbalance.toFixed(2)}, Accepted: ${repairAccepted}`);
  
  return {
    repaired: repairAccepted,
    originalImbalance,
    newImbalance: repairAccepted ? newImbalance : originalImbalance,
    repairs: repairAccepted ? allRepairs : [],
    repairedTransactions: repairAccepted ? currentTransactions : transactions,
  };
}

/**
 * Get repair summary for UI display
 */
export function getRepairSummary(result: RepairResult): string {
  if (!result.repaired) {
    return 'No repairs applied';
  }
  
  const improvement = result.originalImbalance - result.newImbalance;
  return `${result.repairs.length} repair(s) applied, reduced imbalance by ${improvement.toFixed(2)}`;
}
