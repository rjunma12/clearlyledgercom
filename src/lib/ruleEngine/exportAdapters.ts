/**
 * Export Format Adapters
 * Specialized formatters for QuickBooks, Xero, Sage, and other accounting software
 */

import type { ParsedTransaction, ParsedDocument } from './types';

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type ExportFormatType = 
  | 'standard'    // ClearlyLedger default format
  | 'quickbooks'  // QuickBooks Desktop/Online
  | 'xero'        // Xero
  | 'sage'        // Sage 50/100
  | 'wave'        // Wave Accounting
  | 'freshbooks'; // FreshBooks

export interface ExportFormat {
  id: ExportFormatType;
  name: string;
  description: string;
  fileExtension: 'csv' | 'xlsx';
  dateFormat: string;
  columns: ExportColumn[];
  options?: ExportOptions;
}

export interface ExportColumn {
  /** Output column header */
  header: string;
  /** Source field from ParsedTransaction */
  source: keyof ParsedTransaction | 'computed';
  /** Transform function for the value */
  transform?: (value: unknown, transaction: ParsedTransaction) => string | number;
  /** Width for XLSX export */
  width?: number;
}

export interface ExportOptions {
  /** Include balance column */
  includeBalance?: boolean;
  /** How to handle amounts */
  amountFormat?: 'separate' | 'merged-signed' | 'merged-indicator';
  /** Debit/Credit indicators for merged format */
  indicators?: { debit: string; credit: string };
  /** Include header row */
  includeHeaders?: boolean;
  /** Date format string */
  dateFormat?: string;
  /** Decimal places for amounts */
  decimalPlaces?: number;
}

export interface ExportedData {
  headers: string[];
  rows: (string | number)[][];
  format: ExportFormat;
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

function formatDate(isoDate: string, format: string): string {
  if (!isoDate || isoDate.length === 0) return '';
  
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  
  const [year, month, day] = parts;
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return isoDate;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`;
    case 'DD MMM YYYY':
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(month, 10) - 1;
      return `${day} ${monthNames[monthIndex] ?? month} ${year}`;
    default:
      return isoDate;
  }
}

// =============================================================================
// AMOUNT FORMATTING
// =============================================================================

function formatAmount(value: number | null, decimalPlaces: number = 2): string {
  if (value === null) return '';
  return value.toFixed(decimalPlaces);
}

function getMergedAmount(
  transaction: ParsedTransaction,
  indicators?: { debit: string; credit: string }
): string {
  if (transaction.debit !== null) {
    const amount = formatAmount(transaction.debit);
    return indicators ? `${amount} ${indicators.debit}` : `-${amount}`;
  }
  if (transaction.credit !== null) {
    const amount = formatAmount(transaction.credit);
    return indicators ? `${amount} ${indicators.credit}` : amount;
  }
  return '';
}

function getSignedAmount(transaction: ParsedTransaction): number {
  if (transaction.debit !== null) return -transaction.debit;
  if (transaction.credit !== null) return transaction.credit;
  return 0;
}

// =============================================================================
// FORMAT DEFINITIONS
// =============================================================================

const STANDARD_FORMAT: ExportFormat = {
  id: 'standard',
  name: 'ClearlyLedger Standard',
  description: 'Standard 5-column format (Date, Description, Debit, Credit, Balance)',
  fileExtension: 'csv',
  dateFormat: 'YYYY-MM-DD',
  columns: [
    { header: 'Date', source: 'date', width: 12 },
    { header: 'Description', source: 'description', width: 50 },
    { header: 'Debit', source: 'debit', transform: (v) => formatAmount(v as number | null), width: 15 },
    { header: 'Credit', source: 'credit', transform: (v) => formatAmount(v as number | null), width: 15 },
    { header: 'Balance', source: 'balance', transform: (v) => formatAmount(v as number | null), width: 15 },
  ],
};

const QUICKBOOKS_FORMAT: ExportFormat = {
  id: 'quickbooks',
  name: 'QuickBooks',
  description: 'Compatible with QuickBooks Desktop and Online',
  fileExtension: 'csv',
  dateFormat: 'MM/DD/YYYY',
  columns: [
    { 
      header: 'Date', 
      source: 'date',
      transform: (v) => formatDate(v as string, 'MM/DD/YYYY'),
      width: 12,
    },
    { header: 'Description', source: 'description', width: 50 },
    { 
      header: 'Amount', 
      source: 'computed',
      transform: (_, t) => getSignedAmount(t),
      width: 15,
    },
  ],
  options: {
    includeBalance: false,
    amountFormat: 'merged-signed',
  },
};

const QUICKBOOKS_DETAILED_FORMAT: ExportFormat = {
  id: 'quickbooks',
  name: 'QuickBooks (Detailed)',
  description: 'QuickBooks format with separate debit/credit columns',
  fileExtension: 'csv',
  dateFormat: 'MM/DD/YYYY',
  columns: [
    { 
      header: 'Date', 
      source: 'date',
      transform: (v) => formatDate(v as string, 'MM/DD/YYYY'),
      width: 12,
    },
    { header: 'Description', source: 'description', width: 50 },
    { 
      header: 'Payment', 
      source: 'debit',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
    { 
      header: 'Deposit', 
      source: 'credit',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
  ],
  options: {
    includeBalance: false,
    amountFormat: 'separate',
  },
};

const XERO_FORMAT: ExportFormat = {
  id: 'xero',
  name: 'Xero',
  description: 'Compatible with Xero bank statement import',
  fileExtension: 'csv',
  dateFormat: 'DD/MM/YYYY',
  columns: [
    { 
      header: 'Date', 
      source: 'date',
      transform: (v) => formatDate(v as string, 'DD/MM/YYYY'),
      width: 12,
    },
    { 
      header: 'Amount', 
      source: 'computed',
      transform: (_, t) => getSignedAmount(t),
      width: 15,
    },
    { header: 'Payee', source: 'description', width: 50 },
    { 
      header: 'Description', 
      source: 'description',
      width: 50,
    },
    { 
      header: 'Reference', 
      source: 'id',
      width: 20,
    },
  ],
  options: {
    includeBalance: false,
    amountFormat: 'merged-signed',
  },
};

const SAGE_FORMAT: ExportFormat = {
  id: 'sage',
  name: 'Sage 50',
  description: 'Compatible with Sage 50 Accounts',
  fileExtension: 'csv',
  dateFormat: 'DD/MM/YYYY',
  columns: [
    { 
      header: 'Date', 
      source: 'date',
      transform: (v) => formatDate(v as string, 'DD/MM/YYYY'),
      width: 12,
    },
    { header: 'Details', source: 'description', width: 50 },
    { 
      header: 'Debit', 
      source: 'debit',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
    { 
      header: 'Credit', 
      source: 'credit',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
    { 
      header: 'Balance', 
      source: 'balance',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
  ],
  options: {
    includeBalance: true,
    amountFormat: 'separate',
  },
};

const WAVE_FORMAT: ExportFormat = {
  id: 'wave',
  name: 'Wave Accounting',
  description: 'Compatible with Wave bank statement import',
  fileExtension: 'csv',
  dateFormat: 'YYYY-MM-DD',
  columns: [
    { 
      header: 'Date', 
      source: 'date',
      width: 12,
    },
    { header: 'Description', source: 'description', width: 50 },
    { 
      header: 'Amount', 
      source: 'computed',
      transform: (_, t) => getSignedAmount(t),
      width: 15,
    },
  ],
  options: {
    includeBalance: false,
    amountFormat: 'merged-signed',
  },
};

const FRESHBOOKS_FORMAT: ExportFormat = {
  id: 'freshbooks',
  name: 'FreshBooks',
  description: 'Compatible with FreshBooks import',
  fileExtension: 'csv',
  dateFormat: 'YYYY-MM-DD',
  columns: [
    { 
      header: 'Date', 
      source: 'date',
      width: 12,
    },
    { header: 'Description', source: 'description', width: 50 },
    { 
      header: 'Credit Amount', 
      source: 'credit',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
    { 
      header: 'Debit Amount', 
      source: 'debit',
      transform: (v) => formatAmount(v as number | null),
      width: 15,
    },
  ],
  options: {
    includeBalance: false,
    amountFormat: 'separate',
  },
};

// =============================================================================
// FORMAT REGISTRY
// =============================================================================

const FORMAT_REGISTRY: Map<ExportFormatType, ExportFormat> = new Map([
  ['standard', STANDARD_FORMAT],
  ['quickbooks', QUICKBOOKS_FORMAT],
  ['xero', XERO_FORMAT],
  ['sage', SAGE_FORMAT],
  ['wave', WAVE_FORMAT],
  ['freshbooks', FRESHBOOKS_FORMAT],
]);

/**
 * Get all available export formats
 */
export function getAvailableFormats(): ExportFormat[] {
  return [
    STANDARD_FORMAT,
    QUICKBOOKS_FORMAT,
    QUICKBOOKS_DETAILED_FORMAT,
    XERO_FORMAT,
    SAGE_FORMAT,
    WAVE_FORMAT,
    FRESHBOOKS_FORMAT,
  ];
}

/**
 * Get a specific export format
 */
export function getExportFormat(formatType: ExportFormatType): ExportFormat {
  return FORMAT_REGISTRY.get(formatType) ?? STANDARD_FORMAT;
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export transactions to the specified format
 */
export function exportTransactions(
  transactions: ParsedTransaction[],
  formatType: ExportFormatType = 'standard'
): ExportedData {
  const format = getExportFormat(formatType);
  
  const headers = format.columns.map(col => col.header);
  
  const rows = transactions.map(transaction => {
    return format.columns.map(col => {
      if (col.source === 'computed' && col.transform) {
        return col.transform(null, transaction);
      }
      
      const value = transaction[col.source as keyof ParsedTransaction];
      
      if (col.transform) {
        return col.transform(value, transaction);
      }
      
      if (value === null || value === undefined) {
        return '';
      }
      
      return String(value);
    });
  });
  
  return { headers, rows, format };
}

/**
 * Export a parsed document to the specified format
 */
export function exportDocument(
  document: ParsedDocument,
  formatType: ExportFormatType = 'standard'
): ExportedData {
  const allTransactions = document.segments.flatMap(s => s.transactions);
  return exportTransactions(allTransactions, formatType);
}

/**
 * Convert exported data to CSV string
 */
export function toCSVString(data: ExportedData): string {
  const escapeCSV = (value: string | number): string => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const headerRow = data.headers.map(escapeCSV).join(',');
  const dataRows = data.rows.map(row => 
    row.map(escapeCSV).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Get column widths for XLSX export
 */
export function getColumnWidths(format: ExportFormat): number[] {
  return format.columns.map(col => col.width ?? 15);
}

// =============================================================================
// FORMAT PREVIEW
// =============================================================================

/**
 * Generate a preview of how data will look in the selected format
 */
export function generatePreview(
  transactions: ParsedTransaction[],
  formatType: ExportFormatType,
  maxRows: number = 5
): ExportedData {
  const previewTransactions = transactions.slice(0, maxRows);
  return exportTransactions(previewTransactions, formatType);
}

/**
 * Get format compatibility notes
 */
export function getFormatNotes(formatType: ExportFormatType): string[] {
  switch (formatType) {
    case 'quickbooks':
      return [
        'Use "Bank Feeds > Upload Transactions" in QuickBooks Online',
        'Amounts are shown as negative for debits, positive for credits',
        'Date format: MM/DD/YYYY',
      ];
    case 'xero':
      return [
        'Import via Settings > Bank Accounts > Import a Statement',
        'Payee field is populated from description',
        'Date format: DD/MM/YYYY',
      ];
    case 'sage':
      return [
        'Import via File > Import > Bank Statement',
        'Includes balance column for reconciliation',
        'Date format: DD/MM/YYYY',
      ];
    case 'wave':
      return [
        'Import via Banking > Import Bank Statement',
        'Uses signed amounts (negative for debits)',
        'Date format: YYYY-MM-DD',
      ];
    case 'freshbooks':
      return [
        'Import via Expenses > Import Expenses',
        'Separate credit and debit columns',
        'Date format: YYYY-MM-DD',
      ];
    default:
      return [
        'Standard 5-column format',
        'Compatible with most spreadsheet applications',
        'Date format: YYYY-MM-DD (ISO 8601)',
      ];
  }
}
