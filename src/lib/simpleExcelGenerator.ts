/**
 * Simplified Single-Sheet Excel Generator
 * Outputs a clean bank statement format with account details + transactions
 */

import ExcelJS from 'exceljs';

export interface SimpleTransaction {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
}

export interface SimpleAccountInfo {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  statementPeriod: string;
  openingBalance?: string;
  closingBalance?: string;
}

export interface SimpleExcelOptions {
  accountInfo: SimpleAccountInfo;
  transactions: SimpleTransaction[];
  filename: string;
}

const TRANSACTION_COLUMNS = [
  { header: 'Date', key: 'date', width: 14 },
  { header: 'Description', key: 'description', width: 50 },
  { header: 'Withdrawal Amt.', key: 'debit', width: 15 },
  { header: 'Deposit Amt.', key: 'credit', width: 15 },
  { header: 'Balance', key: 'balance', width: 15 },
];

/**
 * Generate a simplified single-sheet Excel file
 */
export async function generateSimpleExcel(options: SimpleExcelOptions): Promise<ArrayBuffer> {
  const { accountInfo, transactions: rawTransactions } = options;
  
  // Address/disclaimer patterns to filter out non-transaction content
  const addressPatterns = [
    /toll\s*free/i,
    /customer\s*care/i,
    /customer\s*service/i,
    /phone|tel|fax/i,
    /office\s*:/i,
    /www\./i,
    /disclaimer/i,
    /terms\s+(and|&)/i,
    /regd\.?\s*office/i,
    /cin\s*[:.-]/i,
    /gstin/i,
    /gst\s*no/i,
    /email\s*id/i,
    /contact\s*us/i,
    /helpline/i,
    /pincode/i,
    /authorised\s*signator/i,
    /does\s+not\s+require/i,
    /bank\s+address/i,
    /branch\s+address/i,
    /floor,?\s*no/i,
    /building\s*no/i,
    /plot\s*no/i,
  ];

  // Filter out completely empty rows AND address/disclaimer content
  const transactions = rawTransactions.filter(tx => {
    // Skip completely empty rows
    const hasContent = (tx.date && tx.date.trim()) || 
      (tx.description && tx.description.trim()) || 
      (tx.debit && tx.debit.trim()) || 
      (tx.credit && tx.credit.trim()) || 
      (tx.balance && tx.balance.trim());
    
    if (!hasContent) return false;
    
    // Check if description contains address/disclaimer content
    const descLower = (tx.description || '').toLowerCase();
    const isAddressRow = addressPatterns.some(p => p.test(descLower));
    
    if (isAddressRow) {
      console.log('[SimpleExcelGenerator] Skipping address/footer row:', tx.description?.substring(0, 60));
      return false;
    }
    
    return true;
  });
  
  console.log(`[SimpleExcelGenerator] Filtered ${rawTransactions.length} rows -> ${transactions.length} valid transactions`);
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ClearlyLedger';
  workbook.created = new Date();
  
  const sheet = workbook.addWorksheet('Bank Statement');
  
  // ==========================================================================
  // SECTION 1: Account Header (Rows 1-5)
  // ==========================================================================
  
  // Set column widths for header section
  sheet.getColumn(1).width = 18;
  sheet.getColumn(2).width = 50;
  
  // Add account details (with Opening/Closing Balance)
  const headerData = [
    ['Bank Name', accountInfo.bankName || 'Unknown Bank'],
    ['Account Holder', accountInfo.accountHolder || ''],
    ['Account Number', accountInfo.accountNumber || ''],
    ['Statement Period', accountInfo.statementPeriod || ''],
    ['Opening Balance', accountInfo.openingBalance || ''],
    ['Closing Balance', accountInfo.closingBalance || ''],
  ];
  
  headerData.forEach((row, index) => {
    const rowNum = index + 1;
    const excelRow = sheet.getRow(rowNum);
    excelRow.getCell(1).value = row[0];
    excelRow.getCell(2).value = row[1];
    
    // Style label cell
    excelRow.getCell(1).font = { bold: true, size: 11 };
    excelRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }, // Light gray
    };
    
    // Style value cell
    excelRow.getCell(2).font = { size: 11 };
    
    excelRow.commit();
  });
  
  // ==========================================================================
  // SECTION 2: Empty Row (Row 8)
  // ==========================================================================
  
  // Leave row 8 empty as separator (after 6 header rows)
  
  // ==========================================================================
  // SECTION 3: Transaction Table Header (Row 9)
  // ==========================================================================
  
  const tableStartRow = 9;
  
  // Set column widths for transaction table
  TRANSACTION_COLUMNS.forEach((col, index) => {
    sheet.getColumn(index + 1).width = col.width;
  });
  
  // Add header row
  const headerRow = sheet.getRow(tableStartRow);
  TRANSACTION_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }, // Dark gray header
    };
    cell.alignment = { horizontal: col.key === 'description' ? 'left' : 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  headerRow.height = 20;
  headerRow.commit();
  
  // ==========================================================================
  // SECTION 4: Transaction Data (Rows 8+)
  // ==========================================================================
  
  transactions.forEach((tx, index) => {
    const rowNum = tableStartRow + 1 + index;
    const dataRow = sheet.getRow(rowNum);
    
    dataRow.getCell(1).value = tx.date;
    dataRow.getCell(2).value = tx.description;
    dataRow.getCell(3).value = formatAmount(tx.debit);
    dataRow.getCell(4).value = formatAmount(tx.credit);
    dataRow.getCell(5).value = formatAmount(tx.balance);
    
    // Style alternating rows
    const isEven = index % 2 === 0;
    const bgColor = isEven ? 'FFFFFFFF' : 'FFF9FAFB';
    
    for (let col = 1; col <= 5; col++) {
      const cell = dataRow.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
      cell.font = { size: 10 };
      
      // Align amounts to the right
      if (col >= 3) {
        cell.alignment = { horizontal: 'right' };
        cell.numFmt = '#,##0.00';
      } else if (col === 1) {
        cell.alignment = { horizontal: 'center' };
      }
    }
    
    dataRow.commit();
  });
  
  // Freeze header row for easy scrolling
  sheet.views = [
    { state: 'frozen', ySplit: tableStartRow, activeCell: 'A8' }
  ];
  
  // Return as ArrayBuffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

/**
 * Format amount string for display
 */
function formatAmount(value: string | number | null | undefined): string | number {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  // If already a number, return as-is
  if (typeof value === 'number') {
    return value;
  }
  
  // Try to parse as number
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  return value;
}
