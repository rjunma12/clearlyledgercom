
# Backend PDF Processing Test Infrastructure

## Current Situation

The ClearlyLedger conversion pipeline is entirely **client-side**:

| Component | Technology | Runs In |
|-----------|------------|---------|
| PDF Loading | pdfjs-dist | Browser |
| Text Extraction | pdfjs-dist text layer | Browser |
| OCR (scanned) | tesseract.js | Browser |
| Rule Engine | TypeScript (geometric parsing) | Browser |
| Export Generation | ExcelJS via Edge Function | Server |

**The backend can only receive already-parsed transaction data** - it cannot process raw PDFs.

## Option 1: Create a Test Page (Fastest)

Add a hidden `/test-conversion` route that:
- Bypasses quota limits for testing
- Shows detailed timing breakdowns for each stage
- Logs all intermediate data (columns detected, rows extracted, etc.)
- Allows unlimited page processing

**Files to Create:**
- `src/pages/TestConversion.tsx` - Test interface with detailed logging
- `src/components/TestFileUpload.tsx` - Enhanced upload component with timing

**Output:**
```text
PDF Type: TEXT_BASED (1,247 chars on page 1)
Page Count: 3
Text Extraction: 245ms
Table Detection: 89ms  
  - Lines detected: 47
  - Columns: [date, description, debit, credit, balance]
  - Confidence: 0.92
Row Processing: 156ms
  - Transactions: 24
  - Opening balance: Yes
  - Closing balance: Yes
Validation: 34ms
  - Balance check: PASSED
  - Errors: 0
  - Warnings: 1
Total Time: 524ms
```

## Option 2: Create Backend Processing Capability (Complex)

This would require significant changes:

### Edge Function Infrastructure

```text
supabase/functions/process-pdf/
├── index.ts          # Entry point
├── pdfParser.ts      # Server-side PDF parsing
└── deps.ts           # Deno-compatible dependencies
```

### Technical Challenges

| Challenge | Browser Solution | Server Solution |
|-----------|------------------|-----------------|
| PDF Parsing | pdfjs-dist | pdf-lib or external service |
| OCR | tesseract.js WASM | Google Vision API or external |
| Canvas | DOM canvas | No native support |
| Memory | User device | Edge function limits (256MB) |

### Required Dependencies

1. **pdf-lib** - Can parse PDFs in Deno but text extraction is limited
2. **External OCR Service** - Google Vision, AWS Textract, or Azure Form Recognizer
3. **PDF Text Extraction Service** - Like pdf.co or pdftables.com

### Migration Scope

1. Abstract the rule engine to work with raw text (already mostly done)
2. Create server-side PDF text extraction
3. Handle OCR via external API
4. Move processing from client to server

## Recommendation

**Start with Option 1** (Test Page) to:
1. Test the current pipeline with your PDF without limits
2. Get detailed timing and quality metrics
3. Identify any parsing issues

**Then evaluate Option 2** if you need:
- Processing without client resources
- Higher security (files never leave server)
- API-first architecture for integrations

## Implementation for Option 1

### New Test Page

```typescript
// Route: /test-conversion (not linked in navigation)
// Features:
// - No quota checks
// - No page limits
// - Detailed console logging
// - Timing breakdown per stage
// - Raw data inspection
// - Export all debug info
```

### Timing Instrumentation

Add detailed timing to each pipeline stage:
- `loadPdfDocument()` - PDF loading time
- `analyzePdfType()` - Type detection time
- `extractTextFromPage()` - Per-page extraction
- `detectAndExtractTables()` - Table detection
- `processExtractedRows()` - Row processing
- `validateDocument()` - Balance validation

### Quality Metrics Dashboard

Display:
- PDF type (text-based vs scanned)
- Characters extracted per page
- Columns detected with confidence scores
- Transaction count vs expected
- Balance validation results
- Any auto-repair actions taken

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/TestConversion.tsx` | Create | Test UI with detailed output |
| `src/components/TestFileUpload.tsx` | Create | Unlimited processing component |
| `src/lib/pdfProcessor.ts` | Modify | Add timing instrumentation |
| `src/lib/ruleEngine/index.ts` | Modify | Add debug output hooks |
| `src/App.tsx` | Modify | Add `/test-conversion` route |

## Next Steps

1. **Approve this plan** to create the test infrastructure
2. **Upload your PDF** through the test page
3. **Review results** including timing, transaction count, validation
4. **Decide on backend** based on performance needs
