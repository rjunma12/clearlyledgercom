/**
 * Post-Processing Passes
 * Applied after initial parsing to fill gaps in CCY and balance columns,
 * and to fix year-boundary issues in multi-year PDFs.
 */

import type { ParsedTransaction } from './types';

// =============================================================================
// 1. CCY FORWARD-FILL
// =============================================================================

/**
 * Forward-fill empty originalCurrency values.
 * If a row's originalCurrency is empty, carry the last non-empty value forward.
 * If no CCY has been seen yet, default to `fallbackCurrency`.
 */
export function forwardFillCurrency(
  transactions: ParsedTransaction[],
  fallbackCurrency: string
): ParsedTransaction[] {
  let lastCcy = fallbackCurrency;

  return transactions.map(tx => {
    if (tx.originalCurrency && tx.originalCurrency.length > 0) {
      lastCcy = tx.originalCurrency;
      return tx;
    }
    return { ...tx, originalCurrency: lastCcy };
  });
}

// =============================================================================
// 2. BALANCE BACKWARD-FILL + FORWARD-FILL
// =============================================================================

/**
 * Fill gaps in the balance column.
 *
 * Strategy:
 *  1. Backward pass (bottom-to-top): if the row below has a known balance,
 *     compute the current row's balance as:
 *       balance = balance_below - credit_below + debit_below
 *  2. Forward pass (top-to-bottom fallback): carry the last known balance
 *     forward for any remaining gaps.
 *
 * "Gap" = balance is exactly 0 AND neither credit nor debit produced it
 * (heuristic: a row with balance===0 where the previous row also had balance===0
 *  is more likely a gap than a real zero balance).
 *
 * To be safe, we mark a balance as "missing" only when it is exactly 0 and the
 * row has no debit and no credit, OR when the original rawBalance was empty.
 * We use a separate flag array to track truly missing balances.
 */
export function fillBalanceGaps(
  transactions: ParsedTransaction[]
): ParsedTransaction[] {
  if (transactions.length === 0) return transactions;

  const result = transactions.map(tx => ({ ...tx }));

  // Build a "missing" mask: balance is NaN (unparseable) OR (balance is 0 and both debit/credit are null)
  const missing = result.map(
    tx => isNaN(tx.balance) || (tx.balance === 0 && tx.debit === null && tx.credit === null)
  );

  // Backward fill: scan from second-to-last row upward
  for (let i = result.length - 2; i >= 0; i--) {
    if (!missing[i]) continue;
    const below = result[i + 1];
    if (missing[i + 1]) continue; // can't compute from another missing row

    const belowCredit = below.credit ?? 0;
    const belowDebit = below.debit ?? 0;
    // balance[i] = balance[i+1] - credit[i+1] + debit[i+1]
    const computed = below.balance - belowCredit + belowDebit;
    result[i].balance = isNaN(computed) ? 0 : computed;
    missing[i] = false;
  }

  // Forward fill: carry last known balance for any still-missing rows
  let lastKnown: number | null = null;
  for (let i = 0; i < result.length; i++) {
    if (!missing[i]) {
      lastKnown = result[i].balance;
    } else if (lastKnown !== null) {
      result[i].balance = lastKnown;
      missing[i] = false;
    }
  }

  return result;
}

// =============================================================================
// 3. MULTI-YEAR CHRONOLOGICAL FIX
// =============================================================================

/**
 * Detect and correct year-boundary issues in multi-year combined PDFs.
 *
 * Problem: When a PDF contains Jan 2024 → Dec 2024 followed by Jan 2025 → Jun 2025,
 * the naive descending-order detector sees Jan 2025 < Dec 2024 as a "reversal" and
 * may flip the order incorrectly.
 *
 * Solution: If we detect that dates are mostly ascending but have year-boundary
 * "resets" (month drops from 12→1 with year incrementing by 1), we flag those
 * transitions as legitimate year boundaries and keep ascending order.
 *
 * This function returns `true` if the transactions look like a valid multi-year
 * ascending sequence (meaning auto-reversal should NOT be applied).
 */
export function isMultiYearAscending(transactions: ParsedTransaction[]): boolean {
  const dates = transactions
    .map(tx => tx.date)
    .filter(d => d && d.length >= 10)
    .map(d => new Date(d));

  if (dates.length < 3) return false;

  let ascending = 0;
  let descending = 0;
  let yearBoundaries = 0;

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1];
    const curr = dates[i];
    if (isNaN(prev.getTime()) || isNaN(curr.getTime())) continue;

    const diff = curr.getTime() - prev.getTime();

    if (diff >= 0) {
      ascending++;
    } else {
      // Check if this is a year-boundary: previous is late in year, current is early in next year
      const prevMonth = prev.getMonth(); // 0-11
      const currMonth = curr.getMonth();
      const yearDiff = curr.getFullYear() - prev.getFullYear();

      if (yearDiff === 1 && prevMonth >= 10 && currMonth <= 1) {
        // Legitimate year rollover, count as ascending
        yearBoundaries++;
        ascending++;
      } else {
        descending++;
      }
    }
  }

  const total = ascending + descending;
  if (total === 0) return false;

  // If mostly ascending (>=80%) and has year boundaries, it's a multi-year doc
  return yearBoundaries > 0 && (ascending / total) >= 0.8;
}
