/**
 * Universal Skip Patterns
 * Filters out page headers, footers, subtotals, and noise from transaction parsing
 */

// =============================================================================
// PAGE STRUCTURE PATTERNS
// =============================================================================

/** Patterns that indicate page headers */
export const PAGE_HEADER_PATTERNS: RegExp[] = [
  /^page\s*\d+/i,
  /^\d+\s*of\s*\d+$/i,
  /^statement\s+(of\s+)?account/i,
  /^account\s+statement/i,
  /^transaction\s+(history|detail)/i,
  /^account\s+activity/i,
  /^checking\s+(account\s+)?summary/i,
  /^savings\s+(account\s+)?summary/i,
  /^credit\s+card\s+statement/i,
];

/** Patterns that indicate page footers */
export const PAGE_FOOTER_PATTERNS: RegExp[] = [
  /^this\s+statement\s+is/i,
  /^please\s+(examine|review)/i,
  /^thank\s+you\s+for\s+(banking|your\s+business)/i,
  /^member\s+fdic/i,
  /^equal\s+housing\s+lender/i,
  /^registered\s+in\s+england/i,
  /^registered\s+office/i,
  /^this\s+is\s+a\s+(computer|system)/i,
  /^does\s+not\s+require\s+signature/i,
  /^continued\s+(on\s+next\s+page|from\s+previous)/i,
];

// =============================================================================
// ACCOUNT METADATA PATTERNS
// =============================================================================

/** Patterns for account information rows */
export const ACCOUNT_INFO_PATTERNS: RegExp[] = [
  /^account\s+(number|#|no\.?)/i,
  /^a\/c\s*(number|#|no\.?)/i,
  /^account\s+holder/i,
  /^customer\s+(name|id)/i,
  /^branch\s+(name|code)/i,
  /^sort\s+code/i,
  /^ifsc\s+code/i,
  /^swift\s+code/i,
  /^iban/i,
  /^bic/i,
  /^routing\s+number/i,
  /^statement\s+(period|date)/i,
  /^from\s+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s+to\s+\d{1,2}/i,
];

// =============================================================================
// SUMMARY & SUBTOTAL PATTERNS
// =============================================================================

/** Patterns for summary/subtotal rows */
export const SUMMARY_PATTERNS: RegExp[] = [
  /^(sub)?total/i,
  /^total\s+(deposits?|withdrawals?|credits?|debits?)/i,
  /^balance\s+summary/i,
  /^account\s+summary/i,
  /^summary\s+of\s+(charges|transactions)/i,
  /^daily\s+balance\s+summary/i,
  /^minimum\s+balance/i,
  /^average\s+(daily\s+)?balance/i,
  /^interest\s+(earned|charged|rate)/i,
  /^service\s+charge/i,
  /^monthly\s+fee/i,
  /^fees?\s+charged/i,
];

// =============================================================================
// SECTION HEADER PATTERNS
// =============================================================================

/** Patterns for section headers within statements */
export const SECTION_HEADER_PATTERNS: RegExp[] = [
  /^deposits?\s+and\s+(other\s+)?(additions?|credits?)/i,
  /^withdrawals?\s+and\s+(other\s+)?(subtractions?|debits?)/i,
  /^electronic\s+(withdrawals?|deposits?)/i,
  /^atm\s+(&|and)\s+debit\s+card/i,
  /^checks?\s+(paid|cleared)/i,
  /^other\s+(transactions?|activity)/i,
  /^pending\s+transactions?/i,
  /^posted\s+transactions?/i,
  /^debit\s+card\s+transactions?/i,
  /^credit\s+card\s+transactions?/i,
  /^wire\s+transfers?/i,
  /^ach\s+transactions?/i,
];

// =============================================================================
// INSTRUCTION PATTERNS
// =============================================================================

/** Patterns for instructional text */
export const INSTRUCTION_PATTERNS: RegExp[] = [
  /^how\s+to\s+read/i,
  /^important\s+(notice|information)/i,
  /^please\s+note/i,
  /^note:/i,
  /^remarks?:/i,
  /^legend:/i,
  /^key:/i,
  /^abbreviations?:/i,
  /^dr\s*=\s*debit/i,
  /^cr\s*=\s*credit/i,
];

// =============================================================================
// ADDRESS & DISCLAIMER PATTERNS
// =============================================================================

/** Address and disclaimer patterns - filter non-transaction content */
export const ADDRESS_PATTERNS: RegExp[] = [
  /\b(toll\s*free|helpline|customer\s*care)\b/i,
  /\b(phone|tel|fax|email)\s*[:.]?\s*[\d\-\(\)]+/i,
  /\b(registered\s+)?office\s*:/i,
  /\b(pin\s*code|postal\s*code|zip)\s*[:\-]?\s*\d+/i,
  /\b(address|location)\s*:/i,
  /\bwww\.\w+\.(com|in|org|net|co)/i,
  /\b(city|state|district)\s*:/i,
  /\bterms\s+(and|&)\s+conditions/i,
  /\bdisclaimer\b/i,
  /\b(head|corporate|main)\s+office/i,
  /\bregd\.?\s*(office|address)/i,
  /\bcin\s*[:.-]?\s*[A-Z0-9]+/i,  // Corporate ID Number
  /\b(gstin|gst\s*no\.?)\s*[:.-]?\s*\w+/i,  // GST Number
  /\bfor\s+(any|your)\s+(queries?|complaints?|assistance)/i,
  /\bthis\s+is\s+an?\s+(electronic|computer|system)\s+generated/i,
  /\bauthorised\s+signator/i,
  /\bdoes\s+not\s+require\s+signature/i,
  /\bcontact\s+us\s*(at|on)?/i,
  /\bemail\s*id\s*:/i,
  /\bwebsite\s*:/i,
  /\bcustomer\s+service/i,
  /\bbank\s+address/i,
  /\bbranch\s+address/i,
  /\bfloor,?\s*(no\.?)?\s*\d/i,  // Floor numbers
  /\bbuilding\s*(no\.?)?\s*\d/i,  // Building numbers
  /\bplot\s*(no\.?)?\s*\d/i,  // Plot numbers
  /\bstreet\s*(no\.?)?\s*\d/i,  // Street numbers
  /\bpincode\s*\d{6}/i,  // Indian pincode
];

// =============================================================================
// NOISE PATTERNS
// =============================================================================

/** General noise patterns */
export const NOISE_PATTERNS: RegExp[] = [
  /^-+$/,  // Lines of dashes
  /^=+$/,  // Lines of equals
  /^\*+$/,  // Lines of asterisks
  /^_+$/,  // Lines of underscores
  /^\s*$/,  // Empty or whitespace-only
  /^[\d\s\/\-]+$/,  // Only numbers, spaces, and date separators (likely noise)
];

// =============================================================================
// COMBINED PATTERNS
// =============================================================================

/** All skip patterns combined */
export const ALL_SKIP_PATTERNS: RegExp[] = [
  ...PAGE_HEADER_PATTERNS,
  ...PAGE_FOOTER_PATTERNS,
  ...ACCOUNT_INFO_PATTERNS,
  ...SUMMARY_PATTERNS,
  ...SECTION_HEADER_PATTERNS,
  ...INSTRUCTION_PATTERNS,
  ...NOISE_PATTERNS,
  ...ADDRESS_PATTERNS,
];

// =============================================================================
// BANK-SPECIFIC SKIP PATTERNS
// =============================================================================

/** Bank-specific noise patterns by bank profile ID */
const BANK_SKIP_PATTERNS: Record<string, RegExp[]> = {
  'chase-us': [
    /^ending balance on/i,
    /^beginning balance on/i,
    /^daily ending balance/i,
  ],
  'bofa-us': [
    /^ending daily balance/i,
    /^beginning daily balance/i,
  ],
  'wells-fargo-us': [
    /^ending daily collected balance/i,
    /^minimum daily balance/i,
  ],
  'hdfc-india': [
    /^narration$/i,
    /^chq.*no\.?$/i,
    /^value\s*dt$/i,
  ],
  'sbi-india': [
    /^txn\s*branch$/i,
    /^value\s*date$/i,
  ],
  'icici-india': [
    /^tran\s*id$/i,
    /^particulars$/i,
  ],
  'cba-australia': [
    /^interest\s+free\s+days/i,
    /^available\s+funds/i,
  ],
  'westpac-australia': [
    /^credit\s+limit/i,
  ],
  'nab-australia': [
    /^available\s+balance/i,
  ],
  'hsbc-uk': [
    /^branch\s+sort\s+code/i,
  ],
  'barclays-uk': [
    /^your\s+reference/i,
  ],
  'lloyds-uk': [
    /^account\s+type/i,
  ],
  'dbs-singapore': [
    /^reference\s+\d+/i,
  ],
  'standard-chartered': [
    /^advice\s+no/i,
  ],
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if text matches any skip pattern
 */
export function shouldSkipText(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  
  return ALL_SKIP_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text should be skipped for a specific bank
 * Checks both universal patterns and bank-specific patterns
 */
export function shouldSkipTextForBank(text: string, bankId: string | null): boolean {
  // First check universal patterns
  if (shouldSkipText(text)) return true;
  
  // Then check bank-specific patterns
  if (bankId && BANK_SKIP_PATTERNS[bankId]) {
    const trimmed = text.trim().toLowerCase();
    return BANK_SKIP_PATTERNS[bankId].some(pattern => pattern.test(trimmed));
  }
  
  return false;
}

/**
 * Get list of supported bank IDs for skip patterns
 */
export function getSupportedBankIds(): string[] {
  return Object.keys(BANK_SKIP_PATTERNS);
}

/**
 * Check if text is a page header
 */
export function isPageHeader(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return PAGE_HEADER_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is a page footer
 */
export function isPageFooter(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return PAGE_FOOTER_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is account metadata
 */
export function isAccountInfo(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return ACCOUNT_INFO_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is a summary/subtotal row
 */
export function isSummaryRow(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return SUMMARY_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is a section header
 */
export function isSectionHeader(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return SECTION_HEADER_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is instructional content
 */
export function isInstruction(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return INSTRUCTION_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is noise (decorative lines, empty, etc.)
 */
export function isNoise(text: string): boolean {
  const trimmed = text.trim();
  return NOISE_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if text is address/disclaimer content
 */
export function isAddressContent(text: string): boolean {
  const trimmed = text.trim();
  return ADDRESS_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Filter an array of text strings, removing those that should be skipped
 */
export function filterSkippableTexts(texts: string[]): string[] {
  return texts.filter(text => !shouldSkipText(text));
}

/**
 * Classify text into categories
 */
export type TextCategory = 
  | 'transaction'
  | 'page_header'
  | 'page_footer'
  | 'account_info'
  | 'summary'
  | 'section_header'
  | 'instruction'
  | 'noise';

export function classifyText(text: string): TextCategory {
  if (isNoise(text)) return 'noise';
  if (isPageHeader(text)) return 'page_header';
  if (isPageFooter(text)) return 'page_footer';
  if (isAccountInfo(text)) return 'account_info';
  if (isSummaryRow(text)) return 'summary';
  if (isSectionHeader(text)) return 'section_header';
  if (isInstruction(text)) return 'instruction';
  return 'transaction';
}
