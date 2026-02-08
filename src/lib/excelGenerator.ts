/**
 * Standardized Multi-Sheet Excel Generator
 * Generates accounting-safe Excel files with:
 * - Sheet 1: Transactions (primary data)
 * - Sheet 2: Statement_Info (metadata)
 * - Sheet 3: Validation (audit summary)
 * 
 * Rules:
 * - Never output negative numbers
 * - Never populate both Debit and Credit in same row
 * - Empty cells allowed, fake data forbidden
 * - Every cell must map to extracted PDF/OCR text
 */

import ExcelJS from 'exceljs';
import type { 
  StatementMetadata, 
  ValidationSummary, 
  StandardizedTransaction 
} from './ruleEngine/types';

// =============================================================================
// COLUMN DEFINITIONS
// =============================================================================

const TRANSACTION_COLUMNS = [
  { header: 'Date', key: 'date', width: 12 },
  { header: 'Description', key: 'description', width: 50 },
  { header: 'Withdrawal Amt.', key: 'debit', width: 15 },
  { header: 'Deposit Amt.', key: 'credit', width: 15 },
  { header: 'Balance', key: 'balance', width: 15 },
  { header: 'Currency', key: 'currency', width: 10 },
  { header: 'Reference', key: 'reference', width: 20 },
  { header: 'Grade', key: 'grade', width: 8 },
  { header: 'Confidence', key: 'confidence', width: 12 },
];

// Address/disclaimer patterns to filter out non-transaction content
// Enhanced with comprehensive Indian bank footer patterns
const ADDRESS_FILTER_PATTERNS = [
  // General patterns
  /toll\s*free/i,
  /customer\s*care/i,
  /customer\s*service/i,
  /phone|tel|fax/i,
  /office\s*:/i,
  /www\./i,
  /disclaimer/i,
  /terms\s+(and|&)/i,
  
  // Indian bank-specific patterns
  /regd\.?\s*(office|address)/i,
  /registered\s+office/i,
  /corporate\s+office/i,
  /head\s+office/i,
  /cin\s*[:.-]\s*[LU]/i,
  /gstin\s*[:.-]?\s*\d/i,
  /gst\s*no\s*[:.-]?\s*\d/i,
  /email\s*id/i,
  /contact\s*us/i,
  /helpline/i,
  /pincode\s*[:.-]?\s*\d{6}/i,
  /pin\s*code\s*[:.-]?\s*\d{6}/i,
  /authorised\s*signator/i,
  /authorized\s*signator/i,
  
  // Computer-generated statement disclaimers
  /this\s+is\s+a\s+(computer|system)\s+generated/i,
  /does\s+not\s+require\s+(a\s+)?(signature|stamp)/i,
  /electronically\s+generated/i,
  /auto[- ]?generated/i,
  
  // Address components
  /bank\s+address/i,
  /branch\s+address/i,
  /floor,?\s*(no\.?)?\s*\d/i,
  /building\s*(no\.?)?\s*\d/i,
  /plot\s*(no\.?)?\s*\d/i,
  /street\s*(no\.?)?\s*\d/i,
  
  // Indian city/location patterns in footer
  /mumbai\s*[-,]/i,
  /delhi\s*[-,]/i,
  /bangalore\s*[-,]/i,
  /chennai\s*[-,]/i,
  /kolkata\s*[-,]/i,
  /hyderabad\s*[-,]/i,
  
  // Phone number patterns
  /1800[-\s]?\d{3}[-\s]?\d+/i,  // Toll-free: 1800-xxx-xxxx
  /\+91[-\s]?\d{10}/i,          // Indian mobile: +91-xxxxxxxxxx
  /\d{3,4}[-\s]\d{3,4}[-\s]\d{3,4}/i,  // General phone
  
  // Website patterns
  /www\.hdfcbank/i,
  /www\.sbi\./i,
  /www\.icicibank/i,
  /www\.axisbank/i,
  /hdfcbank\.com/i,
  
  // Other footer patterns
  /for\s+(any|your)\s+(queries?|complaints?|assistance)/i,
  /please\s+(contact|call|write)/i,
  /nomination\s+registered/i,
  /interest\s+rate\s*[:.-]/i,
];

/**
 * Filter out address/disclaimer content from transactions
 */
function filterAddressContent(transactions: StandardizedTransaction[]): StandardizedTransaction[] {
  return transactions.filter(tx => {
    const hasContent = tx.date || tx.description || tx.debit || tx.credit || tx.balance;
    if (!hasContent) return false;
    
    const descLower = (tx.description || '').toLowerCase();
    const isAddressRow = ADDRESS_FILTER_PATTERNS.some(p => p.test(descLower));
    
    if (isAddressRow) {
      console.log('[ExcelGenerator] Filtering address/footer row:', tx.description?.substring(0, 60));
      return false;
    }
    
    return true;
  });
}

// =============================================================================
// SHEET GENERATORS
// =============================================================================

/**
 * Generate Transactions sheet (Sheet 1)
 */
function generateTransactionsSheet(
  workbook: ExcelJS.Workbook,
  rawTransactions: StandardizedTransaction[]
): void {
  // Filter out address/disclaimer content
  const transactions = filterAddressContent(rawTransactions);
  console.log(`[ExcelGenerator] Filtered ${rawTransactions.length} rows -> ${transactions.length} valid transactions`);
  const sheet = workbook.addWorksheet('Transactions', {
    properties: { tabColor: { argb: '4472C4' } }
  });

  // Set columns
  sheet.columns = TRANSACTION_COLUMNS;

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  // Add transaction rows
  transactions.forEach((tx, index) => {
    // Extract confidence data from extended transaction
    const extTx = tx as any;
    const grade = extTx.grade || '';
    const confidenceScore = extTx.confidenceScore != null ? `${extTx.confidenceScore}%` : '';
    
    const row = sheet.addRow({
      date: tx.date || '',
      description: tx.description || '',
      debit: tx.debit || '',
      credit: tx.credit || '',
      balance: tx.balance || '',
      currency: tx.currency || '',
      reference: tx.reference || '',
      grade: grade,
      confidence: confidenceScore,
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
    row.getCell('grade').alignment = { horizontal: 'center' };
    row.getCell('confidence').alignment = { horizontal: 'right' };
    
    // Color-code grades
    const gradeCell = row.getCell('grade');
    if (grade === 'A') {
      gradeCell.font = { color: { argb: '008000' }, bold: true }; // Green
    } else if (grade === 'B') {
      gradeCell.font = { color: { argb: '0066CC' } }; // Blue
    } else if (grade === 'C') {
      gradeCell.font = { color: { argb: 'CC6600' } }; // Orange
    } else if (grade === 'D' || grade === 'F') {
      gradeCell.font = { color: { argb: 'CC0000' }, bold: true }; // Red
    }

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
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add borders to all cells
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } },
      };
    });
  });
}

/**
 * Generate Statement_Info sheet (Sheet 2)
 */
function generateStatementInfoSheet(
  workbook: ExcelJS.Workbook,
  metadata: StatementMetadata
): void {
  const sheet = workbook.addWorksheet('Statement_Info', {
    properties: { tabColor: { argb: '70AD47' } }
  });

  // Set column widths
  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 40;

  // Header
  const headerRow = sheet.addRow(['Field', 'Value']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '70AD47' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  // Metadata rows - all fields must be present even if empty
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
  ];

  metadataRows.forEach(([field, value], index) => {
    const row = sheet.addRow([field, value]);
    row.getCell(1).font = { bold: true };
    
    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' }
      };
    }
  });

  // Add borders
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } },
      };
    });
  });
}

/**
 * Generate Validation sheet (Sheet 3)
 */
function generateValidationSheet(
  workbook: ExcelJS.Workbook,
  validation: ValidationSummary
): void {
  const sheet = workbook.addWorksheet('Validation', {
    properties: { tabColor: { argb: 'ED7D31' } }
  });

  // Set column widths
  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 50;

  // Header
  const headerRow = sheet.addRow(['Check', 'Result']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ED7D31' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  // Validation rows
  const validationRows: [string, string][] = [
    ['Opening_Balance_Found', validation.openingBalanceFound ? 'Yes' : 'No'],
    ['Closing_Balance_Found', validation.closingBalanceFound ? 'Yes' : 'No'],
    ['Balance_Check_Passed', validation.balanceCheckPassed ? 'Yes' : 'No'],
    ['Balance_Difference', validation.balanceDifference != null ? String(validation.balanceDifference) : 'N/A'],
    ['Rows_Extracted', String(validation.rowsExtracted)],
    ['Rows_Merged', String(validation.rowsMerged)],
    ['Auto_Repair_Applied', validation.autoRepairApplied ? 'Yes' : 'No'],
    // NEW: Confidence scoring summary
    ['Average_Confidence', validation.averageConfidence != null ? `${validation.averageConfidence}%` : 'N/A'],
    ['Grade_Distribution', validation.gradeDistribution || 'N/A'],
    ['Low_Confidence_Rows', validation.lowConfidenceCount != null ? String(validation.lowConfidenceCount) : '0'],
    ['Warnings', validation.warnings.length > 0 ? validation.warnings.join('; ') : 'None'],
  ];

  validationRows.forEach(([check, result], index) => {
    const row = sheet.addRow([check, result]);
    row.getCell(1).font = { bold: true };

    // Color-code pass/fail
    if (check === 'Balance_Check_Passed') {
      row.getCell(2).font = {
        bold: true,
        color: { argb: validation.balanceCheckPassed ? '008000' : 'FF0000' }
      };
    }

    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FCE4D6' }
      };
    }
  });

  // Add borders
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } },
      };
    });
  });
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export interface ExcelGeneratorOptions {
  transactions: StandardizedTransaction[];
  metadata: StatementMetadata;
  validationSummary: ValidationSummary;
  filename: string;
}

/**
 * Generate standardized multi-sheet Excel workbook
 * Returns ArrayBuffer for download/base64 encoding
 */
export async function generateStandardizedExcel(
  options: ExcelGeneratorOptions
): Promise<ArrayBuffer> {
  const { transactions, metadata, validationSummary, filename } = options;

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ClearlyLedger';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  // Generate all three sheets (mandatory)
  generateTransactionsSheet(workbook, transactions);
  generateStatementInfoSheet(workbook, metadata);
  generateValidationSheet(workbook, validationSummary);

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Determine confidence level from numeric score
 */
export function getConfidenceLevel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 0.9) return 'High';
  if (score >= 0.7) return 'Medium';
  return 'Low';
}
