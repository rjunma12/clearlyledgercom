/**
 * PII Masking Utility
 * Detects and masks personally identifiable information in transaction data
 */

export interface PIIMaskingOptions {
  maskNames: boolean;
  maskEmails: boolean;
  maskPhones: boolean;
  maskAccountNumbers: boolean;
  maskAddresses: boolean;
  maskIds: boolean;
}

export interface MaskedResult {
  originalValue: string;
  maskedValue: string;
  piiDetected: boolean;
  piiTypes: string[];
}

// Name detection patterns
const NAME_PATTERNS = [
  /\b(?:FROM|TO|FOR|BY|ATTN:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
  /\b([A-Z]{2,}(?:\s+[A-Z]{2,})+)\b/g, // JOHN SMITH format
  /(?:MR\.?|MRS\.?|MS\.?|DR\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
];

// Email pattern
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone patterns (international)
const PHONE_PATTERNS = [
  /\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{10,12}\b/g,
];

// Account/ID number patterns
const ACCOUNT_PATTERNS = [
  /\b(?:ACC(?:OUNT)?|A\/C)[-.\s#]*(\d{4,})/gi,
  /\b(?:CARD|CC)[-.\s]+(?:ENDING|END|NO\.?)?[-.\s#]*(\d{4,})/gi,
  /\b(?:REF|REFERENCE|TXN|TRANSACTION)[-.\s#]*([A-Z0-9]{6,})/gi,
  /\b(?:ORDER|ORD)[-.\s#]*([A-Z0-9-]{6,})/gi,
  /\*{2,}\d{4}/g, // Already partially masked like ****4521
];

// ID patterns
const ID_PATTERNS = [
  /\b(?:ID|SSN|NIN|PAN|AADHAAR)[-.\s#:]*([A-Z0-9]{4,})/gi,
  /\b[A-Z]{2,3}\d{6,}/g, // Passport-like IDs
];

// Name counter for anonymization
let nameCounter = 0;
const nameMap = new Map<string, string>();

/**
 * Resets the name counter and mapping (call when starting a new export)
 */
export function resetMaskingState(): void {
  nameCounter = 0;
  nameMap.clear();
}

/**
 * Get or create anonymized name
 */
function getAnonymizedName(originalName: string): string {
  const normalized = originalName.trim().toUpperCase();
  if (nameMap.has(normalized)) {
    return nameMap.get(normalized)!;
  }
  nameCounter++;
  const masked = `Person_${String(nameCounter).padStart(3, '0')}`;
  nameMap.set(normalized, masked);
  return masked;
}

/**
 * Mask email address: user@domain.com → ***@domain.com
 */
function maskEmail(email: string): string {
  const [, domain] = email.split('@');
  return `***@${domain}`;
}

/**
 * Mask phone number: show only last 2-4 digits
 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  const lastDigits = digits.slice(-4);
  return `***-***-${lastDigits}`;
}

/**
 * Mask account/ID number
 */
function maskAccountNumber(account: string): string {
  const alphanumeric = account.replace(/[^A-Z0-9]/gi, '');
  if (alphanumeric.length <= 4) return '****XXXX';
  const lastChars = alphanumeric.slice(-4);
  return `****${lastChars.replace(/./g, 'X')}`;
}

/**
 * Detect and mask PII in a single text value
 */
export function maskPIIInText(
  text: string,
  options: PIIMaskingOptions = {
    maskNames: true,
    maskEmails: true,
    maskPhones: true,
    maskAccountNumbers: true,
    maskAddresses: true,
    maskIds: true,
  }
): MaskedResult {
  let maskedValue = text;
  const piiTypes: string[] = [];
  let piiDetected = false;

  // Mask emails first (most specific pattern)
  if (options.maskEmails) {
    const emails = text.match(EMAIL_PATTERN);
    if (emails) {
      piiDetected = true;
      piiTypes.push('email');
      emails.forEach((email) => {
        maskedValue = maskedValue.replace(email, maskEmail(email));
      });
    }
  }

  // Mask phone numbers
  if (options.maskPhones) {
    for (const pattern of PHONE_PATTERNS) {
      const phones = maskedValue.match(pattern);
      if (phones) {
        phones.forEach((phone) => {
          // Only mask if it looks like a phone (has enough digits and not already masked)
          if (phone.replace(/\D/g, '').length >= 10 && !phone.includes('***')) {
            piiDetected = true;
            if (!piiTypes.includes('phone')) piiTypes.push('phone');
            maskedValue = maskedValue.replace(phone, maskPhone(phone));
          }
        });
      }
    }
  }

  // Mask account numbers and card numbers
  if (options.maskAccountNumbers) {
    for (const pattern of ACCOUNT_PATTERNS) {
      const matches = maskedValue.matchAll(pattern);
      for (const match of matches) {
        piiDetected = true;
        if (!piiTypes.includes('account')) piiTypes.push('account');
        
        // Replace only the number portion, keeping the prefix
        if (match[1]) {
          maskedValue = maskedValue.replace(match[1], maskAccountNumber(match[1]));
        } else {
          maskedValue = maskedValue.replace(match[0], maskAccountNumber(match[0]));
        }
      }
    }
  }

  // Mask IDs
  if (options.maskIds) {
    for (const pattern of ID_PATTERNS) {
      const matches = maskedValue.matchAll(pattern);
      for (const match of matches) {
        piiDetected = true;
        if (!piiTypes.includes('id')) piiTypes.push('id');
        
        if (match[1]) {
          maskedValue = maskedValue.replace(match[1], '****XXXX');
        } else {
          maskedValue = maskedValue.replace(match[0], '****XXXX');
        }
      }
    }
  }

  // Mask names (do this last as it's the least specific)
  if (options.maskNames) {
    for (const pattern of NAME_PATTERNS) {
      const matches = Array.from(maskedValue.matchAll(pattern));
      for (const match of matches) {
        const fullMatch = match[0];
        const namePart = match[1] || fullMatch;
        
        // Skip if it's a common business name or already masked
        if (isLikelyBusinessName(namePart) || namePart.includes('Person_')) continue;
        
        piiDetected = true;
        if (!piiTypes.includes('name')) piiTypes.push('name');
        
        const anonymized = getAnonymizedName(namePart);
        maskedValue = maskedValue.replace(namePart, `[${anonymized}]`);
      }
    }
  }

  return {
    originalValue: text,
    maskedValue,
    piiDetected,
    piiTypes,
  };
}

/**
 * Check if a name is likely a business name (not a person)
 */
function isLikelyBusinessName(name: string): boolean {
  const businessIndicators = [
    'CORP', 'CORPORATION', 'INC', 'LLC', 'LTD', 'LIMITED', 'CO', 'COMPANY',
    'BANK', 'STORE', 'SHOP', 'MARKET', 'AMAZON', 'WALMART', 'TARGET',
    'STARBUCKS', 'UBER', 'LYFT', 'NETFLIX', 'SPOTIFY', 'APPLE', 'GOOGLE',
    'MICROSOFT', 'PAYPAL', 'VENMO', 'ZELLE', 'SQUARE', 'STRIPE',
    'RESTAURANT', 'CAFE', 'HOTEL', 'AIRLINES', 'AIRWAYS',
    'INSURANCE', 'ELECTRIC', 'WATER', 'GAS', 'UTILITY', 'UTILITIES',
    'ACME', 'PURCHASE', 'PAYMENT', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL',
    'REFUND', 'FEE', 'CHARGE', 'SERVICE', 'SUBSCRIPTION',
  ];
  
  const upperName = name.toUpperCase();
  return businessIndicators.some((indicator) => upperName.includes(indicator));
}

/**
 * Interface for transaction row with PII fields
 */
export interface TransactionWithPII {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  account?: string;
  [key: string]: string | undefined;
}

/**
 * Mask all PII in a transaction array
 */
export function maskTransactionData(
  transactions: TransactionWithPII[],
  options?: PIIMaskingOptions
): TransactionWithPII[] {
  // Reset state for new masking session
  resetMaskingState();
  
  const defaultOptions: PIIMaskingOptions = {
    maskNames: true,
    maskEmails: true,
    maskPhones: true,
    maskAccountNumbers: true,
    maskAddresses: true,
    maskIds: true,
  };
  
  const maskingOptions = options || defaultOptions;
  
  return transactions.map((transaction) => {
    const maskedTransaction: TransactionWithPII = { ...transaction };
    
    // Mask description (most likely to contain PII)
    if (transaction.description) {
      const result = maskPIIInText(transaction.description, maskingOptions);
      maskedTransaction.description = result.maskedValue;
    }
    
    // Mask account number if present
    if (transaction.account && maskingOptions.maskAccountNumbers) {
      maskedTransaction.account = '****XXXX';
    }
    
    return maskedTransaction;
  });
}

/**
 * Generate export filename based on masking type
 */
export function generateExportFilename(
  originalFilename: string,
  isMasked: boolean,
  format: 'xlsx' | 'csv' = 'csv'
): string {
  const baseName = originalFilename.replace(/\.[^/.]+$/, ''); // Remove extension
  const suffix = isMasked ? '_anonymized' : '_full';
  return `${baseName}${suffix}.${format}`;
}
