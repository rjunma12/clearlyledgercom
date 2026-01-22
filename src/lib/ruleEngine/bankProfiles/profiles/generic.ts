/**
 * Generic Bank Profile
 * Fallback profile for unknown banks with intelligent defaults
 */

import type { BankProfile } from '../types';

export const genericProfile: BankProfile = {
  id: 'generic',
  name: 'Generic Bank',
  region: 'GLOBAL',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [], // Matches nothing - used as fallback
    confidenceThreshold: 0,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: false,
    // No column hints - rely on header detection
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: [
        'DD/MM/YYYY',
        'MM/DD/YYYY',
        'YYYY-MM-DD',
        'DD-MM-YYYY',
        'DD MMM YYYY',
        'MMM DD, YYYY',
      ],
      yearFormat: 'both',
    },
    amountFormatting: {
      negativeFormat: 'minus',
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^page\s*\d+/i,
      /^\d+\s*of\s*\d+$/i,
      /^continued\s*(from|on)/i,
    ],
    pageHeaderPatterns: [
      /^statement\s+(of\s+)?account/i,
      /^account\s+statement/i,
      /^transaction\s+history/i,
    ],
    pageFooterPatterns: [
      /^this\s+statement\s+is/i,
      /^please\s+examine/i,
      /^thank\s+you\s+for\s+banking/i,
    ],
  },
};
