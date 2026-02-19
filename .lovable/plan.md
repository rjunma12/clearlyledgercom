
# Issues Preventing Statement Conversion

After a deep analysis of the rule engine pipeline, I found **4 issues** that can cause balance validation failures and blocked exports. These are in addition to the column detection fix already applied.

---

## Issue 1: Detected Date Format is Computed but Never Passed to `parseDate()`

**File:** `src/lib/ruleEngine/index.ts` (lines 414-464)

The pipeline runs a date format detection pass that correctly identifies whether dates are DD/MM/YYYY or MM/DD/YYYY. However, the result (`detectedDateFormat`) is never used -- `parseDate()` is called with only the locale, not the detected format.

**What goes wrong:** For dates like `04/07/2025` (July 4 in DD/MM format), the `parseDate` function iterates through regex patterns in order. The `MM/DD/YYYY` pattern at line 268 matches first, and unless the locale is explicitly non-US, it may parse as April 7 instead of July 4. Wrong dates cause incorrect chronological ordering and cascading validation failures.

**Fix:** Pass `detectedDateFormat` into `parseDate()` and use it to prioritize the correct pattern. When `detectedDateFormat === 'DD/MM/YYYY'`, force DD/MM interpretation regardless of which regex matches first.

---

## Issue 2: Opening Balance Not Used from Detected Opening Balance Row

**File:** `src/lib/ruleEngine/balanceValidator.ts` (lines 362-370)

The `processExtractedRows` function correctly detects the "Opening Balance" row and stores it in `processingResult.openingBalance`. However, the `splitIntoSegments` function ignores this and instead derives the opening balance by back-calculating from the first transaction: `balance - credit + debit`.

**What goes wrong:** If the first transaction has any parsing issue (wrong amount, wrong column, missing value), the derived opening balance will be wrong, causing every subsequent row to fail validation. The explicit opening balance from the PDF is more reliable.

**Fix:** In `processDocument`, pass the detected opening balance value into the segment when available. Fall back to the calculation method only when no explicit opening balance row was found.

---

## Issue 3: Unparseable Balance Defaults to 0, Not Treated as Missing

**File:** `src/lib/ruleEngine/index.ts` (line 466)

When `parseNumber(raw.rawBalance)` returns `null` (unparseable), the code defaults to `0`:
```
balance: parseNumber(raw.rawBalance ?? '', numberFormat) ?? 0
```

Meanwhile, `fillBalanceGaps` only marks a balance as "missing" when `balance === 0 AND debit === null AND credit === null`. If a transaction has valid amounts but a balance that failed to parse (now incorrectly 0), it won't be identified as a gap and won't be filled.

**What goes wrong:** Transactions with legitimate amounts but unparseable balances get balance=0, which causes a massive validation error because the running balance equation fails.

**Fix:** Track which balances came from actual parsing vs. the `?? 0` fallback using a flag or sentinel value (e.g., `NaN` or a separate `balanceMissing` boolean). Update `fillBalanceGaps` to use this flag instead of the heuristic.

---

## Issue 4: Segment Opening Balance Should Prefer Explicit Value

**File:** `src/lib/ruleEngine/index.ts` (lines 508-513) and `balanceValidator.ts` (lines 331-360)

When `splitIntoSegments` creates segments, it calls `calculateOpeningBalance(firstTx)` which computes: `firstTx.balance - credit + debit`. This is fragile because:
- If the first transaction's balance was unparseable (now 0 per Issue 3), the opening balance becomes completely wrong.
- The explicit "Opening Balance" row detected by `processExtractedRows` is only used later during auto-repair (lines 594-603), not during the primary validation pass.

**Fix:** Before calling `splitIntoSegments`, inject the parsed opening balance from `processingResult.openingBalance` into the first segment's `openingBalance` field.

---

## Implementation Summary

| Issue | File(s) | Impact |
|-------|---------|--------|
| 1. Date format not wired | `index.ts`, `numberParser.ts` | Wrong date parse for ambiguous dates, causing ordering and validation failures |
| 2. Opening balance ignored | `index.ts`, `balanceValidator.ts` | Cascading balance errors when first row has any issue |
| 3. Unparseable balance = 0 | `index.ts`, `postProcessingPasses.ts` | False validation errors on rows with parse failures |
| 4. Segment uses fragile derivation | `index.ts` | Compounds issues 2 and 3 |

All four fixes reinforce each other. Issues 2-4 specifically explain how 15 out of 19 transactions could show balance errors from a single root cause (wrong opening balance propagating through the chain).
