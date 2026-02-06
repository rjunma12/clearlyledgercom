/**
 * Statement Header Extractor
 * Parses the first lines of PDF pages to extract account metadata
 * for the Statement_Info sheet in Excel exports.
 * 
 * Security: Account numbers are always masked to last 4 digits.
 * No PII is ever logged.
 */

import type { BankProfile } from './bankProfiles/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Generic line input - accepts any object with text or words property
 * This allows flexibility for both PdfLine and ExtractedRow inputs
 */
export interface LineInput {
  text?: string;
  words?: Array<{ text: string }>;
  description?: string;  // For ExtractedRow compatibility
}

export interface ExtractedStatementHeader {
  accountHolder?: string;
  accountNumber?: string;           // Full number (internal use only)
  accountNumberMasked?: string;     // Last 4 digits only (for export)
  statementPeriodFrom?: string;     // YYYY-MM-DD or original format
  statementPeriodTo?: string;       // YYYY-MM-DD or original format
  bankName?: string;
  ifscCode?: string;
  branchName?: string;
  customerId?: string;
  currency?: string;
  bsbNumber?: string;               // Australian BSB
  sortCode?: string;                // UK Sort Code
  routingNumber?: string;           // US Routing Number
}

// =============================================================================
// EXTRACTION PATTERNS (Region-aware)
// =============================================================================

const EXTRACTION_PATTERNS = {
  // Account holder name patterns - expanded for Indian banks
  accountHolder: [
    // Indian banks: "Name :- DR DEEPIKAS HEALTHPLUS PVT LTD"
    /Name\s*:[-]?\s*(.+?)(?:\s*$|Account|A\/C|Branch|IFSC|Customer|CIF)/i,
    // Generic: "Account Holder: John Smith"
    /Account\s*Holder\s*:?\s*(.+?)(?:\s*$|Account|Branch)/i,
    // Generic: "Customer Name: John Smith"
    /Customer\s*Name\s*:?\s*(.+?)(?:\s*$|Account|Branch)/i,
    // UK/AU style: "A/C Name: John Smith"
    /A\/C\s*Name\s*:?\s*(.+?)(?:\s*$|Account|Branch)/i,
    // Simple name line (fallback)
    /(?:Name|Holder)\s*:?\s*(.+)/i,
    // NEW: Statement for/of patterns
    /Statement\s+for\s+(.+?)(?:\s*Account|\s*A\/C|\s*$)/i,
    /Statement\s+of\s+Account\s+(?:for\s+)?(.+?)(?:\s*Account|\s*Period|\s*$)/i,
    // NEW: Account in the name of
    /Account\s+in\s+the\s+name\s+of\s+(.+?)(?:\s*$|Account|Branch)/i,
  ],

  // Account number patterns
  accountNumber: [
    // Indian: "Account Number : 131010200026549" or "Account No.: 50200012345678"
    /Account\s*(?:Number|No\.?)\s*:?\s*(\d{8,20})/i,
    // Short form: "A/C No.: 12345678901"
    /A\/C\s*(?:Number|No\.?)\s*:?\s*(\d{8,20})/i,
    // Just "Account: 12345678"
    /Account\s*:?\s*(\d{8,20})/i,
    // UK with sort code: "Account: 12345678"
    /(?:Account|A\/C)\s*(?:No\.?)?\s*:?\s*(\d{6,12})/i,
    // Australian BSB + Account: "BSB: 062-000 Account: 12345678"
    /Account\s*(?:Number|No\.?)?\s*:?\s*(\d{6,10})/i,
    // NEW: Standalone account number pattern
    /(?:^|\s)(\d{10,17})(?:\s|$)/,
  ],

  // Statement period patterns
  statementPeriod: [
    // Indian: "for the period (From : 01-03-2025 To : 31-03-2025)"
    /\(?From\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*To\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\)?/i,
    // Generic: "From: 01/03/2025 To: 31/03/2025"
    /From\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*(?:To|[-–])\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    // Period: "Period: 01-Mar-2025 to 31-Mar-2025"
    /Period\s*:?\s*(\d{1,2}[-/]?\s*\w{3,9}[-/]?\s*\d{2,4})\s*(?:to|[-–])\s*(\d{1,2}[-/]?\s*\w{3,9}[-/]?\s*\d{2,4})/i,
    // UK/US text dates: "Statement from 1 March 2025 to 31 March 2025"
    /Statement\s+(?:from|for)\s+(\d{1,2}\s+\w+\s+\d{4})\s+(?:to|-)\s+(\d{1,2}\s+\w+\s+\d{4})/i,
    // Date range with dash: "01/03/2025 - 31/03/2025"
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*[-–to]+\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    // Australian: "For the period 1 Mar 2025 to 31 Mar 2025"
    /(?:For\s+)?(?:the\s+)?period\s+(\d{1,2}\s+\w{3,9}\s+\d{4})\s+to\s+(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
    // NEW: Date DD MMM YYYY format
    /(\d{1,2}\s+\w{3}\s+\d{4})\s*(?:to|[-–])\s*(\d{1,2}\s+\w{3}\s+\d{4})/i,
  ],

  // IFSC Code (Indian banks)
  ifscCode: [
    /IFSC\s*(?:Code)?\s*:?\s*([A-Z]{4}0[A-Z0-9]{6})/i,
    /IFS\s*Code\s*:?\s*([A-Z]{4}0[A-Z0-9]{6})/i,
    // NEW: Bare IFSC pattern
    /\b([A-Z]{4}0[A-Z0-9]{6})\b/,
  ],

  // Branch name
  branchName: [
    /Branch\s*(?:Name)?\s*:?\s*(.+?)(?:\s*$|IFSC|Account|Phone|Tel)/i,
    /(?:Home\s+)?Branch\s*:?\s*(.+?)(?:\s*$|IFSC|Account)/i,
  ],

  // Customer ID / CIF
  customerId: [
    /Customer\s*ID\s*:?\s*(\w+)/i,
    /CIF\s*(?:No\.?|Number)?\s*:?\s*(\w+)/i,
    /Client\s*(?:ID|No\.?)\s*:?\s*(\w+)/i,
  ],

  // BSB (Australian banks)
  bsbNumber: [
    /BSB\s*(?:Number|No\.?)?\s*:?\s*(\d{3}[-\s]?\d{3})/i,
    /BSB\s*:?\s*(\d{6})/i,
  ],

  // Sort Code (UK banks)
  sortCode: [
    /Sort\s*Code\s*:?\s*(\d{2}[-\s]?\d{2}[-\s]?\d{2})/i,
    /S\/C\s*:?\s*(\d{6})/i,
  ],

  // Routing Number (US banks)
  routingNumber: [
    /Routing\s*(?:Number|No\.?)?\s*:?\s*(\d{9})/i,
    /ABA\s*(?:Number|No\.?)?\s*:?\s*(\d{9})/i,
  ],

  // Currency detection
  currency: [
    /Currency\s*:?\s*([A-Z]{3})/i,
    /(?:Amount\s+in|All\s+amounts\s+in)\s+([A-Z]{3})/i,
    // Infer from symbol
    /(?:Opening|Closing)\s*Balance\s*:?\s*([₹$€£¥])/i,
    // NEW: Amounts in currency
    /(?:All\s+)?amounts?\s+(?:are\s+)?in\s+([A-Z]{3})/i,
  ],
};

// Known bank patterns for fallback detection
const KNOWN_BANKS = [
  { pattern: /ICICI\s*Bank/i, name: 'ICICI Bank' },
  { pattern: /HDFC\s*Bank/i, name: 'HDFC Bank' },
  { pattern: /State\s*Bank\s*of\s*India|SBI/i, name: 'State Bank of India' },
  { pattern: /Axis\s*Bank/i, name: 'Axis Bank' },
  { pattern: /Kotak\s*Mahindra/i, name: 'Kotak Mahindra Bank' },
  { pattern: /IndusInd/i, name: 'IndusInd Bank' },
  { pattern: /Yes\s*Bank/i, name: 'Yes Bank' },
  { pattern: /Punjab\s*National\s*Bank|PNB/i, name: 'Punjab National Bank' },
  { pattern: /Bank\s*of\s*Baroda|BoB/i, name: 'Bank of Baroda' },
  { pattern: /Canara\s*Bank/i, name: 'Canara Bank' },
  { pattern: /Union\s*Bank/i, name: 'Union Bank of India' },
  { pattern: /IDBI\s*Bank/i, name: 'IDBI Bank' },
  { pattern: /Federal\s*Bank/i, name: 'Federal Bank' },
  { pattern: /RBL\s*Bank/i, name: 'RBL Bank' },
  { pattern: /Bandhan\s*Bank/i, name: 'Bandhan Bank' },
  // International banks
  { pattern: /HSBC/i, name: 'HSBC' },
  { pattern: /Barclays/i, name: 'Barclays' },
  { pattern: /Lloyds/i, name: 'Lloyds Bank' },
  { pattern: /NatWest/i, name: 'NatWest' },
  { pattern: /Commonwealth\s*Bank|CBA/i, name: 'Commonwealth Bank' },
  { pattern: /ANZ\s*Bank|ANZ/i, name: 'ANZ Bank' },
  { pattern: /Westpac/i, name: 'Westpac' },
  { pattern: /NAB|National\s*Australia/i, name: 'NAB' },
  { pattern: /Chase/i, name: 'Chase' },
  { pattern: /Bank\s*of\s*America/i, name: 'Bank of America' },
  { pattern: /Wells\s*Fargo/i, name: 'Wells Fargo' },
  { pattern: /Citibank|Citi/i, name: 'Citibank' },
  { pattern: /DBS\s*Bank/i, name: 'DBS Bank' },
  { pattern: /Standard\s*Chartered/i, name: 'Standard Chartered' },
];

// Currency symbol to code mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  '₹': 'INR',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  'A$': 'AUD',
  'S$': 'SGD',
  'R': 'ZAR',
  'RM': 'MYR',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Masks account number to show only last 4 digits
 * Security: This is the ONLY function that should expose account numbers
 */
export function maskAccountNumber(accountNumber: string | undefined): string {
  if (!accountNumber || accountNumber.length < 4) {
    return '';
  }
  // Remove non-digits for consistent masking
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length < 4) {
    return '';
  }
  return '****' + digits.slice(-4);
}

/**
 * Cleans extracted text value
 */
function cleanValue(value: string | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/[:\-]+$/, '')          // Remove trailing colons/dashes
    .trim();
}

/**
 * Normalizes date format (attempts to convert to YYYY-MM-DD)
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const cleaned = dateStr.trim();
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // DD-MM-YYYY or DD/MM/YYYY (Indian, UK, AU format)
  const ddmmyyyy = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // MM-DD-YYYY or MM/DD/YYYY (US format) - harder to detect, keep original
  const mmddyyyy = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (mmddyyyy) {
    // Assume DD-MM-YYYY unless month > 12
    const [, first, second, year] = mmddyyyy;
    if (parseInt(first) > 12) {
      // Must be DD-MM-YYYY
      return `${year}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
    }
    // Keep as DD-MM-YYYY (most common globally)
    return `${year}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
  }
  
  // Text format: "1 March 2025" or "01 Mar 2025"
  const textDate = cleaned.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (textDate) {
    const [, day, monthName, year] = textDate;
    const monthNum = parseMonthName(monthName);
    if (monthNum) {
      return `${year}-${monthNum.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Return original if can't parse
  return cleaned;
}

/**
 * Parses month name to number
 */
function parseMonthName(monthName: string): string | null {
  const months: Record<string, string> = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12',
  };
  return months[monthName.toLowerCase()] || null;
}

/**
 * Extracts a pattern match from text lines
 */
function extractPattern(
  lines: string[],
  patterns: RegExp[],
  groupIndex: number = 1
): string | undefined {
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[groupIndex]) {
        return cleanValue(match[groupIndex]);
      }
    }
  }
  return undefined;
}

/**
 * Extracts date range from text lines
 */
function extractDateRange(
  lines: string[]
): { from?: string; to?: string } {
  for (const line of lines) {
    for (const pattern of EXTRACTION_PATTERNS.statementPeriod) {
      const match = line.match(pattern);
      if (match && match[1] && match[2]) {
        return {
          from: normalizeDate(match[1]),
          to: normalizeDate(match[2]),
        };
      }
    }
  }
  return {};
}

/**
 * Detects currency from text
 */
function detectCurrency(lines: string[]): string | undefined {
  // First try explicit patterns
  for (const line of lines) {
    for (const pattern of EXTRACTION_PATTERNS.currency) {
      const match = line.match(pattern);
      if (match && match[1]) {
        // Check if it's a symbol
        if (CURRENCY_SYMBOLS[match[1]]) {
          return CURRENCY_SYMBOLS[match[1]];
        }
        // It's a currency code
        if (/^[A-Z]{3}$/.test(match[1])) {
          return match[1];
        }
      }
    }
  }
  
  // Fallback: scan for currency symbols
  const allText = lines.join(' ');
  for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
    if (allText.includes(symbol)) {
      return code;
    }
  }
  
  return undefined;
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extracts statement header metadata from PDF lines
 * 
 * @param lines - First N lines from the PDF (typically first 20-30 lines)
 *                Can be PdfLine[], ExtractedRow[], or any array with text/words/description
 * @param bankProfile - Optional detected bank profile for region-specific parsing
 * @returns Extracted statement header with masked account number
 */
export function extractStatementHeader(
  lines: LineInput[],
  bankProfile?: BankProfile
): ExtractedStatementHeader {
  // Convert line array to text array
  // Use first 30 lines max (header area)
  const textLines = lines
    .slice(0, 30)
    .map(line => {
      // Check for 'text' property first
      if ('text' in line && typeof line.text === 'string' && line.text.length > 0) {
        return line.text;
      }
      // Check for 'description' property (ExtractedRow compatibility)
      if ('description' in line && typeof line.description === 'string' && line.description.length > 0) {
        return line.description;
      }
      // Fallback: if it's a line with words array
      if ('words' in line && Array.isArray(line.words)) {
        return line.words.map((w) => w.text).join(' ');
      }
      return '';
    })
    .filter(text => text.length > 0);
  
  // Extract fields using patterns
  const result: ExtractedStatementHeader = {};
  
  // Account holder
  result.accountHolder = extractPattern(textLines, EXTRACTION_PATTERNS.accountHolder);
  
  // Account number (raw)
  const rawAccountNumber = extractPattern(textLines, EXTRACTION_PATTERNS.accountNumber);
  if (rawAccountNumber) {
    result.accountNumber = rawAccountNumber;
    result.accountNumberMasked = maskAccountNumber(rawAccountNumber);
  }
  
  // Statement period
  const dateRange = extractDateRange(textLines);
  if (dateRange.from) result.statementPeriodFrom = dateRange.from;
  if (dateRange.to) result.statementPeriodTo = dateRange.to;
  
  // IFSC Code (Indian banks)
  result.ifscCode = extractPattern(textLines, EXTRACTION_PATTERNS.ifscCode);
  
  // Branch name
  result.branchName = extractPattern(textLines, EXTRACTION_PATTERNS.branchName);
  
  // Customer ID
  result.customerId = extractPattern(textLines, EXTRACTION_PATTERNS.customerId);
  
  // BSB (Australian)
  result.bsbNumber = extractPattern(textLines, EXTRACTION_PATTERNS.bsbNumber);
  
  // Sort Code (UK)
  result.sortCode = extractPattern(textLines, EXTRACTION_PATTERNS.sortCode);
  
  // Routing Number (US)
  result.routingNumber = extractPattern(textLines, EXTRACTION_PATTERNS.routingNumber);
  
  // Currency
  result.currency = detectCurrency(textLines);
  
  // Bank name from profile if provided
  if (bankProfile?.name) {
    result.bankName = bankProfile.name;
  }
  
  // NEW: Fallback bank name detection from text content
  if (!result.bankName) {
    result.bankName = detectBankNameFromText(textLines);
  }
  
  // NEW: Infer currency from regional identifiers
  if (!result.currency) {
    result.currency = inferCurrencyFromRegion(result);
  }
  
  // Log extraction summary (no PII)
  console.log('[StatementHeaderExtractor] Extracted fields:', {
    hasAccountHolder: !!result.accountHolder,
    hasAccountNumber: !!result.accountNumberMasked,
    hasPeriod: !!(result.statementPeriodFrom && result.statementPeriodTo),
    hasIfsc: !!result.ifscCode,
    hasBranch: !!result.branchName,
    hasBankName: !!result.bankName,
    currency: result.currency,
  });
  
  return result;
}

/**
 * Extracts statement header from raw text content
 * Alternative entry point for when line objects aren't available
 */
export function extractStatementHeaderFromText(
  text: string,
  bankProfile?: BankProfile
): ExtractedStatementHeader {
  // Split text into lines
  const textLines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Convert to simple LineInput objects
  const lineInputs: LineInput[] = textLines.slice(0, 30).map((lineText) => ({
    text: lineText,
  }));
  
  return extractStatementHeader(lineInputs, bankProfile);
}
