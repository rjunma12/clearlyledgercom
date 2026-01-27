import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import ExcelJS from "https://esm.sh/exceljs@4.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// TYPES
// =============================================================================

interface TransactionData {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  currency?: string;
  reference?: string;
  account?: string;
  validationStatus?: 'valid' | 'warning' | 'error' | 'unchecked';
}

interface StatementMetadata {
  bankName?: string;
  accountHolder?: string;
  accountNumberMasked?: string;
  statementPeriodFrom?: string;
  statementPeriodTo?: string;
  openingBalance?: number;
  closingBalance?: number;
  currency?: string;
  pagesProcessed: number;
  pdfType: 'Text' | 'Scanned';
  ocrUsed: boolean;
  conversionTimestamp: string;
  conversionConfidence: 'High' | 'Medium' | 'Low';
  // Additional extracted fields (NEW)
  ifscCode?: string;
  branchName?: string;
  customerId?: string;
  bsbNumber?: string;
  sortCode?: string;
  routingNumber?: string;
}

interface ValidationSummary {
  openingBalanceFound: boolean;
  closingBalanceFound: boolean;
  balanceCheckPassed: boolean;
  balanceDifference?: number;
  rowsExtracted: number;
  rowsMerged: number;
  autoRepairApplied: boolean;
  warnings: string[];
}

interface ValidationResult {
  verdict: 'EXPORT_COMPLETE' | 'EXPORT_INCOMPLETE';
  confidence: number;
  pdfTransactions: number;
  exportedRows: number;
  missingRows?: number;
  corruptedRows?: number;
}

interface ExportRequest {
  transactions: TransactionData[];
  metadata?: StatementMetadata;
  validationSummary?: ValidationSummary;
  exportType: "masked" | "full";
  format: "csv" | "xlsx";
  filename: string;
  pageCount?: number;
  timestamp?: number;
  validationResult?: ValidationResult;
}

// =============================================================================
// PII MASKING
// =============================================================================

const NAME_PATTERN = /\b(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const ACCOUNT_PATTERN = /\b(?:ACC|ACCT|A\/C|Account)[\s#:]*\d{4,}/gi;
const CARD_PATTERN = /(?:card\s+(?:ending\s+)?|ending\s+)(\d{4})/gi;

const nameMap = new Map<string, string>();
let nameCounter = 0;

function resetMaskingState() {
  nameMap.clear();
  nameCounter = 0;
}

function getAnonymizedName(originalName: string): string {
  const normalizedName = originalName.toLowerCase().trim();
  if (!nameMap.has(normalizedName)) {
    nameCounter++;
    nameMap.set(normalizedName, `Person_${String(nameCounter).padStart(3, "0")}`);
  }
  return nameMap.get(normalizedName)!;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  return `***@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `***-***-${digits.slice(-4)}`;
}

function maskAccountNumber(account: string): string {
  const digits = account.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

function maskPIIInText(text: string): string {
  if (!text) return text;

  let masked = text;
  masked = masked.replace(EMAIL_PATTERN, (match) => maskEmail(match));
  masked = masked.replace(PHONE_PATTERN, (match) => maskPhone(match));
  masked = masked.replace(ACCOUNT_PATTERN, () => "ACC ****XXXX");
  masked = masked.replace(CARD_PATTERN, "CARD ENDING XXXX");
  masked = masked.replace(NAME_PATTERN, (match) => getAnonymizedName(match));

  return masked;
}

function maskTransactions(transactions: TransactionData[]): TransactionData[] {
  resetMaskingState();
  return transactions.map((tx) => ({
    ...tx,
    description: maskPIIInText(tx.description),
    account: tx.account ? maskAccountNumber(tx.account) : undefined,
  }));
}

// =============================================================================
// CSV GENERATOR
// =============================================================================

function generateCSV(transactions: TransactionData[], includeAccount: boolean): string {
  const headers = includeAccount
    ? ["Date", "Description", "Debit", "Credit", "Balance", "Account"]
    : ["Date", "Description", "Debit", "Credit", "Balance"];

  const rows = transactions.map((tx) => {
    const baseRow = [
      tx.date,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      tx.debit || "",
      tx.credit || "",
      tx.balance,
    ];
    if (includeAccount) {
      baseRow.push(tx.account || "");
    }
    return baseRow.join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

// =============================================================================
// EXCEL GENERATOR (Multi-Sheet)
// =============================================================================

async function generateExcel(
  transactions: TransactionData[],
  metadata: StatementMetadata,
  validationSummary: ValidationSummary
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ClearlyLedger';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ========================================
  // Sheet 1: Transactions (PRIMARY)
  // ========================================
  const txSheet = workbook.addWorksheet('Transactions', {
    properties: { tabColor: { argb: '4472C4' } }
  });

  // Columns in exact order: Date | Description | Debit | Credit | Balance | Currency | Reference
  txSheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Debit', key: 'debit', width: 15 },
    { header: 'Credit', key: 'credit', width: 15 },
    { header: 'Balance', key: 'balance', width: 15 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Reference', key: 'reference', width: 20 },
  ];

  // Style header row
  const txHeaderRow = txSheet.getRow(1);
  txHeaderRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  txHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  };
  txHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  txHeaderRow.height = 20;

  // Add transaction rows
  transactions.forEach((tx, index) => {
    const row = txSheet.addRow({
      date: tx.date || '',
      description: tx.description || '',
      debit: tx.debit || '',
      credit: tx.credit || '',
      balance: tx.balance || '',
      currency: tx.currency || '',
      reference: tx.reference || '',
    });

    // Alternate row colors
    if (index % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F2F2F2' }
      };
    }

    // Right-align numeric columns
    row.getCell('debit').alignment = { horizontal: 'right' };
    row.getCell('credit').alignment = { horizontal: 'right' };
    row.getCell('balance').alignment = { horizontal: 'right' };

    // Highlight validation errors
    if (tx.validationStatus === 'error') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCC' }
      };
    } else if (tx.validationStatus === 'warning') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2CC' }
      };
    }
  });

  // Freeze header row
  txSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add borders
  txSheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } },
      };
    });
  });

  // ========================================
  // Sheet 2: Statement_Info (METADATA)
  // ========================================
  const infoSheet = workbook.addWorksheet('Statement_Info', {
    properties: { tabColor: { argb: '70AD47' } }
  });

  infoSheet.getColumn(1).width = 25;
  infoSheet.getColumn(2).width = 40;

  const infoHeaderRow = infoSheet.addRow(['Field', 'Value']);
  infoHeaderRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  infoHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '70AD47' }
  };
  infoHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  infoHeaderRow.height = 20;

  // All fields must be present even if empty
  const metadataRows: [string, string][] = [
    ['Bank_Name', metadata.bankName || ''],
    ['Account_Holder', metadata.accountHolder || ''],
    ['Account_Number_Masked', metadata.accountNumberMasked || ''],
    ['Statement_Period_From', metadata.statementPeriodFrom || ''],
    ['Statement_Period_To', metadata.statementPeriodTo || ''],
    ['Opening_Balance', metadata.openingBalance != null ? String(metadata.openingBalance) : ''],
    ['Closing_Balance', metadata.closingBalance != null ? String(metadata.closingBalance) : ''],
    ['Currency', metadata.currency || ''],
    ['Pages_Processed', String(metadata.pagesProcessed)],
    ['PDF_Type', metadata.pdfType],
    ['OCR_Used', metadata.ocrUsed ? 'Yes' : 'No'],
    ['Conversion_Timestamp', metadata.conversionTimestamp],
    ['Conversion_Confidence', metadata.conversionConfidence],
    // Additional extracted fields (NEW)
    ['IFSC_Code', metadata.ifscCode || ''],
    ['Branch_Name', metadata.branchName || ''],
    ['Customer_ID', metadata.customerId || ''],
    ['BSB_Number', metadata.bsbNumber || ''],
    ['Sort_Code', metadata.sortCode || ''],
    ['Routing_Number', metadata.routingNumber || ''],
  ];

  metadataRows.forEach(([field, value], index) => {
    const row = infoSheet.addRow([field, value]);
    row.getCell(1).font = { bold: true };
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' }
      };
    }
  });

  infoSheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } },
      };
    });
  });

  // ========================================
  // Sheet 3: Validation (AUDIT)
  // ========================================
  const valSheet = workbook.addWorksheet('Validation', {
    properties: { tabColor: { argb: 'ED7D31' } }
  });

  valSheet.getColumn(1).width = 25;
  valSheet.getColumn(2).width = 50;

  const valHeaderRow = valSheet.addRow(['Check', 'Result']);
  valHeaderRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  valHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ED7D31' }
  };
  valHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  valHeaderRow.height = 20;

  const validationRows: [string, string][] = [
    ['Opening_Balance_Found', validationSummary.openingBalanceFound ? 'Yes' : 'No'],
    ['Closing_Balance_Found', validationSummary.closingBalanceFound ? 'Yes' : 'No'],
    ['Balance_Check_Passed', validationSummary.balanceCheckPassed ? 'Yes' : 'No'],
    ['Balance_Difference', validationSummary.balanceDifference != null ? String(validationSummary.balanceDifference) : 'N/A'],
    ['Rows_Extracted', String(validationSummary.rowsExtracted)],
    ['Rows_Merged', String(validationSummary.rowsMerged)],
    ['Auto_Repair_Applied', validationSummary.autoRepairApplied ? 'Yes' : 'No'],
    ['Warnings', validationSummary.warnings.length > 0 ? validationSummary.warnings.join('; ') : 'None'],
  ];

  validationRows.forEach(([check, result], index) => {
    const row = valSheet.addRow([check, result]);
    row.getCell(1).font = { bold: true };

    // Color-code pass/fail
    if (check === 'Balance_Check_Passed') {
      row.getCell(2).font = {
        bold: true,
        color: { argb: validationSummary.balanceCheckPassed ? '008000' : 'FF0000' }
      };
    }

    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FCE4D6' }
      };
    }
  });

  valSheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } },
      };
    });
  });

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

// =============================================================================
// FINGERPRINT GENERATION
// =============================================================================

async function generateFingerprint(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    let userId: string | null = null;
    let isAuthenticated = false;
    let fingerprint: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

      if (!userError && user) {
        userId = user.id;
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      fingerprint = await generateFingerprint(clientIP);
    }

    const body: ExportRequest = await req.json();
    const { 
      transactions, 
      metadata, 
      validationSummary,
      exportType, 
      format, 
      filename, 
      pageCount, 
      timestamp, 
      validationResult 
    } = body;

    // Request freshness validation (5-minute window)
    if (timestamp) {
      const now = Date.now();
      const maxAge = 5 * 60 * 1000;
      if (Math.abs(now - timestamp) > maxAge) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Request expired. Please try again.",
            expired: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!transactions || !Array.isArray(transactions)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid transaction data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["masked", "full"].includes(exportType)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid export type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["csv", "xlsx"].includes(format)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Balance validation enforcement
    const errorTransactions = transactions.filter(tx => tx.validationStatus === 'error');
    const warningTransactions = transactions.filter(tx => tx.validationStatus === 'warning');
    
    if (errorTransactions.length > 0) {
      const errorDetails = errorTransactions.slice(0, 3).map((tx, i) => 
        `Row ${i + 1}: ${tx.date} - ${tx.description?.substring(0, 20) || 'N/A'}...`
      ).join('; ');
      
      const moreCount = errorTransactions.length > 3 ? ` and ${errorTransactions.length - 3} more` : '';
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Export blocked: ${errorTransactions.length} transaction(s) failed balance validation. ${errorDetails}${moreCount}. Please review highlighted rows before exporting.`,
          validationFailed: true,
          errorCount: errorTransactions.length,
          warningCount: warningTransactions.length,
          errorTransactions: errorTransactions.slice(0, 5).map((tx, i) => ({
            row: i + 1,
            date: tx.date,
            description: tx.description?.substring(0, 30),
            issue: 'balance_mismatch'
          })),
          guidance: 'Review the transactions marked in red in the preview. Ensure the running balance equation (Previous Balance + Credit - Debit = Current Balance) is correct for each row.'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log validation result
    if (validationResult) {
      console.log('[Export Validation]', {
        verdict: validationResult.verdict,
        confidence: validationResult.confidence,
        pdfTransactions: validationResult.pdfTransactions,
        exportedRows: validationResult.exportedRows,
        missingRows: validationResult.missingRows || 0,
        corruptedRows: validationResult.corruptedRows || 0
      });
      
      if (validationResult.missingRows && validationResult.missingRows > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Export blocked: ${validationResult.missingRows} transaction(s) would be missing from the export. This indicates a data processing error. Please try again or contact support.`,
            validationFailed: true,
            missingRows: validationResult.missingRows,
            guidance: 'This is an unexpected error. Please re-upload your PDF or contact support with your file.'
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's plan
    const { data: planData, error: planError } = await supabaseAdmin.rpc("get_user_plan", {
      p_user_id: userId,
    });

    if (planError) {
      console.error("Error fetching user plan:", planError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify user plan" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = planData?.[0];
    if (!plan) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No active plan found",
          upgradeRequired: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check format restrictions
    const allowedFormats: string[] = plan.allowed_formats || ['csv', 'xlsx'];
    if (!allowedFormats.includes(format)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `${format.toUpperCase()} export requires a paid plan. Please upgrade to access CSV exports.`,
          upgradeRequired: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PII policy
    let actualExportType = exportType;
    if (plan.pii_masking === "enforced") {
      actualExportType = "masked";
    }

    // Check quota
    const { data: remainingPages, error: quotaError } = await supabaseAdmin.rpc(
      "get_remaining_pages",
      { 
        p_user_id: userId,
        p_session_fingerprint: fingerprint 
      }
    );

    if (quotaError) {
      console.error("Error checking quota:", quotaError);
    }

    if (remainingPages !== null && remainingPages !== -1 && remainingPages <= 0) {
      const resetMessage = plan.daily_limit 
        ? "Your daily limit resets in 24 hours."
        : "You have reached your monthly limit.";
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `You have reached your page limit. ${resetMessage} Please upgrade your plan for more capacity.`,
          quotaExceeded: true,
          upgradeRequired: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply masking if needed
    const processedTransactions = actualExportType === "masked"
      ? maskTransactions(transactions)
      : transactions;

    // Generate output based on format
    let content: string;
    let contentType: string;
    let outputFilename: string;
    const suffix = actualExportType === "masked" ? "_anonymized" : "_full";

    if (format === "xlsx") {
      // Build default metadata if not provided
      const defaultMetadata: StatementMetadata = metadata || {
        bankName: '',
        accountHolder: '',
        accountNumberMasked: '',
        statementPeriodFrom: '',
        statementPeriodTo: '',
        openingBalance: undefined,
        closingBalance: undefined,
        currency: '',
        pagesProcessed: pageCount || 0,
        pdfType: 'Text',
        ocrUsed: false,
        conversionTimestamp: new Date().toISOString(),
        conversionConfidence: 'Medium',
      };

      // Build default validation summary if not provided
      const defaultValidation: ValidationSummary = validationSummary || {
        openingBalanceFound: false,
        closingBalanceFound: false,
        balanceCheckPassed: warningTransactions.length === 0,
        balanceDifference: undefined,
        rowsExtracted: transactions.length,
        rowsMerged: 0,
        autoRepairApplied: false,
        warnings: warningTransactions.length > 0 
          ? [`${warningTransactions.length} transaction(s) have balance warnings`] 
          : [],
      };

      // Generate multi-sheet Excel
      const excelBuffer = await generateExcel(
        processedTransactions,
        defaultMetadata,
        defaultValidation
      );
      
      // Convert to base64
      content = btoa(String.fromCharCode(...excelBuffer));
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      outputFilename = `${filename.replace(/\.pdf$/i, "")}${suffix}.xlsx`;
    } else {
      // CSV format
      const hasAccountColumn = transactions.some((tx) => tx.account);
      const csvContent = generateCSV(processedTransactions, hasAccountColumn);
      content = btoa(unescape(encodeURIComponent(csvContent)));
      contentType = "text/csv";
      outputFilename = `${filename.replace(/\.pdf$/i, "")}${suffix}.csv`;
    }

    // Determine if PII was exposed
    const piiExposed = actualExportType === "full";

    // Log export for audit trail
    if (isAuthenticated && userId) {
      const { error: logError } = await supabaseAdmin.from("export_logs").insert({
        user_id: userId,
        filename: outputFilename,
        export_type: actualExportType,
        format: format,
        transaction_count: transactions.length,
        page_count: pageCount || null,
        pii_exposed: piiExposed,
      });

      if (logError) {
        console.error("Failed to log export:", logError);
      }
      
      if (validationResult) {
        console.log(`[Export Audit] User: ${userId}, Verdict: ${validationResult.verdict}, Confidence: ${validationResult.confidence}, Transactions: ${transactions.length}, Format: ${format}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        filename: outputFilename,
        content,
        contentType,
        transactionCount: processedTransactions.length,
        exportType: actualExportType,
        format,
        warningCount: warningTransactions.length,
        message:
          actualExportType !== exportType
            ? plan.pii_masking === "enforced"
              ? "Export automatically anonymized for compliance requirements"
              : "Export type was adjusted to masked for your plan"
            : warningTransactions.length > 0
              ? `Export completed with ${warningTransactions.length} balance warning(s)`
              : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
