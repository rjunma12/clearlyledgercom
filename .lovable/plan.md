
## What’s still causing the “198 error transactions”
From the current code, the errors are almost certainly coming from two combined issues:

1) **Many rows are entering validation without a usable Debit/Credit amount**
- In `validateBalanceEquation`, if `debit` and `credit` are both `null`, the expected balance doesn’t change but the statement’s balance usually does, so the row becomes a validation **error**.
- This can happen when:
  - Column detection doesn’t correctly recognize **“Withdrawal Amt.”** and **“Deposit Amt.”** as debit/credit headers (current regex is too strict).
  - Row extraction uses **strict boundary matching** for *all* columns, which can drop numeric values if they drift slightly outside boundaries.
  - Wrapped rows produce “numeric-only” lines that are currently treated as separate transactions instead of being merged into the previous transaction.

2) **Footer/address content at the end is still being treated as transaction rows**
- `dynamicRowProcessor.classifyRow()` currently builds `fullText` from only: `date + description + debit + credit + balance`.
- If the address/footer text gets extracted into **reference / amount / valueDate** (or just exists in `rawLine` but not in description), it may **not match** `ADDRESS_PATTERNS`, and may still be classified as a transaction due to the “ultra-relaxed” rules.

This explains: “address in the last row” + many rows missing amounts + persistent 198 validation errors.

---

## Changes to implement (rules-based first, OCR as a controlled assist)

### 1) Fix debit/credit header detection for “Withdrawal Amt.” and “Deposit Amt.”
**File:** `src/lib/ruleEngine/tableDetector.ts`

Update the header regex so it matches common Indian statement headers:

- Expand:
  - `HEADER_DEBIT_PATTERNS` to match: `Withdrawal Amt`, `Withdrawal Amount`, `Withdrawals`, etc.
  - `HEADER_CREDIT_PATTERNS` to match: `Deposit Amt`, `Deposit Amount`, etc.
- Ensure punctuation and extra words don’t break detection (e.g., `Amt.`, `Amt`, `Amount`).

**Expected impact:** Far fewer rows will have both `debit` and `credit` missing.

---

### 2) Stop losing numeric values due to overly strict column boundary matching
**File:** `src/lib/ruleEngine/tableDetector.ts`

In `extractRowsFromTable()` we currently do:
```ts
isWordInColumn(w, boundary, true) // strict for all columns
```

Implement a **hybrid matching strategy**:
- Use **strict** matching for text columns (date/description/reference/value_date).
- Use **flexible** matching for numeric columns (withdrawal/deposit/balance/amount), to tolerate small x-drift.
- Add a small padding margin for numeric boundaries (e.g., ±5–10px) to catch near-edge values without causing a cascade.

**Expected impact:** Better capture of withdrawal/deposit values that were previously missed → fewer validation errors.

---

### 3) Make address/footer detection robust by checking the full raw line text
**File:** `src/lib/ruleEngine/dynamicRowProcessor.ts`

Update `classifyRow()` to build `rawLineText` from the actual PDF line:
```ts
const rawLineText = row.rawLine.words.map(w => w.text).join(' ');
```

Then:
- Run `isAddressContent(rawLineText)` (and optionally `shouldSkipText(rawLineText)`) against that full text.
- This ensures footer/address lines are caught even if they land in `reference`, `amount`, `valueDate`, etc.
- Keep the existing `ADDRESS_PATTERNS`, but apply them to `rawLineText` (not only `row.description`).

**Expected impact:** The “address in the last row” should stop appearing in extracted transactions.

---

### 4) Improve stitching: merge “numeric-only continuation lines” into the previous transaction
**File:** `src/lib/ruleEngine/dynamicRowProcessor.ts`

Right now we only stitch **description-only** continuation rows.
But bank statements often wrap like:
- Line 1: date + narration
- Line 2: withdrawal/deposit + closing balance (or reference)
Those Line 2 rows currently become separate transactions with missing date/description, causing validation errors.

Implementation:
- Extend classification to detect a **numeric continuation** row:
  - No recovered date
  - Has numeric content (withdrawal/deposit/balance/amount)
  - Has little/no meaningful description
  - Not skip/footer/address
- In `stitchContinuationRows()`:
  - If current transaction exists and is missing debit/credit/balance, merge these numeric rows into it.
- Add a “resolved values” step in `finalizeStitchedTransaction()`:
  - Fill missing `debit/credit/balance` in the primary row using the continuation row values (without inventing any values).

**Expected impact:** Big drop in rows missing debit/credit → big drop in validation errors.

---

### 5) Tighten which stitched items become exported transactions (reduce noise)
**File:** `src/lib/ruleEngine/dynamicRowProcessor.ts`

Right now `processExtractedRows()` includes *all* stitched rows (except explicit opening/closing).
After adding numeric stitching + better footer detection, we should revert to exporting only:
- `classification.isTransaction === true`

This prevents “semi-rows” from becoming transactions.

**Expected impact:** Fewer false transactions and fewer validation errors.

---

### 6) Add an end-of-statement footer cutoff (optional but effective)
**File:** `src/lib/ruleEngine/dynamicRowProcessor.ts`

Add a heuristic:
- Once we detect a “footer region” (e.g., 3 consecutive footer/address lines) after the last valid transaction, stop processing remaining rows.

**Expected impact:** Guarantees end-of-document address/legal blocks don’t contaminate output.

---

## “Use OCR” — practical, controlled integration (not blanket OCR)
OCR is expensive in-browser and your pipeline is designed to avoid OCR unless needed. We’ll add OCR in two safe, targeted ways:

### 7) Header-only OCR fallback (for Account Holder Name)
**Files:** `src/lib/pdfProcessor.ts` (and use existing `ocrService.ts` + `statementHeaderExtractor.ts`)

If `accountHolder` is not found from text extraction:
- OCR **only page 1**
- Extract header text from OCR and pass it through `extractStatementHeaderFromText()`
- Use it only to fill missing metadata (account holder), not to rewrite transactions.

**Expected impact:** Much higher chance the account holder name appears, even if header is image-based.

### 8) Mixed-PDF page OCR (only for pages detected as scanned)
**File:** `src/lib/pdfProcessor.ts`

Even if page 1 is text-based, later pages can be scanned or have broken text layers.
Add:
- A quick per-page scan check using `isScannedPage(page)`
- OCR only those pages that are scanned and only if within the configured OCR page cap
- Merge OCR text elements for those pages into the processing set

**Expected impact:** If the missing/garbled pages are scanned, transactions become extractable without OCR’ing everything.

---

## Excel output improvements requested
### 9) Rename columns to match the statement terminology
**File:** `src/lib/simpleExcelGenerator.ts`

Change headers:
- “Debit” → **“Withdrawal Amt.”**
- “Credit” → **“Deposit Amt.”**

(Keeping the underlying mapping as debit/credit internally.)

### 10) Show Closing Balance clearly
**Files:** `src/lib/simpleExcelGenerator.ts`, `src/pages/TestConversion.tsx`

- Add a “Closing Balance” field in the top account header block.
- Populate it from the parsed document (last segment closing balance or last transaction balance).
- (Optionally also include Opening Balance if you want parity.)

---

## Debugging/verification additions (so we can prove the fix)
### 11) Add a small debug summary of why rows were skipped / stitched
**Files:** `src/lib/ruleEngine/dynamicRowProcessor.ts`, optionally `src/pages/TestConversion.tsx`

Log counts:
- footer/address lines skipped
- numeric-continuation rows stitched
- rows still missing debit/credit after stitching

This will make it obvious whether the 198 errors are now truly reduced.

---

## Files that will be changed
1) `src/lib/ruleEngine/tableDetector.ts`
- Better debit/credit header detection for “Withdrawal Amt.” / “Deposit Amt.”
- Hybrid strict/flexible extraction for numeric columns

2) `src/lib/ruleEngine/dynamicRowProcessor.ts`
- Address/footer detection uses full raw line text
- Numeric-only continuation stitching + resolved amount propagation
- Transaction filtering tightened (reduce noise)
- Optional footer cutoff

3) `src/lib/pdfProcessor.ts`
- Header-only OCR fallback for missing account holder
- Mixed-page OCR for scanned pages (within cap)

4) `src/lib/simpleExcelGenerator.ts`
- Column headers renamed to Withdrawal/Deposit wording
- Add closing balance to header section

5) `src/pages/TestConversion.tsx`
- Pass closing balance into the simplified Excel generator (and/or display it)

---

## How you will test end-to-end (on /test-conversion)
1) Upload the same PDF again.
2) Confirm:
   - “Missing Amount” count drops sharply.
   - “Error Transactions” drops well below 198.
   - No address/footer content appears as the last transaction row.
3) Download Excel and confirm:
   - Columns show Withdrawal Amt. / Deposit Amt.
   - Closing balance is visible in the header.
   - Transactions include both deposits and withdrawals where present.

---

## Risks / tradeoffs (and how we mitigate)
- Making numeric extraction less strict can increase noise if columns overlap.
  - Mitigation: only relax numeric columns + keep strict for description/date + improved footer detection.
- OCR can be slow.
  - Mitigation: OCR only page 1 for header, and only scanned pages for transactions within cap.
