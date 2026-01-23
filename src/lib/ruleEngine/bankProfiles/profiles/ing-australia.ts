/**
 * ING Australia Profile
 * Digital-first bank with clean statement format
 */

import { BankProfile } from '../types';

export const ingAustraliaProfile: BankProfile = {
  id: 'ing-australia',
  name: 'ING Australia',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'ING',
      'ING Australia',
      'ing.com.au',
      'ING DIRECT', // Previous branding
      'ING Bank',
    ],
    accountPatterns: [
      /\b\d{3}-\d{3}\s*\d{6,10}\b/,
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      /\bAccount\s*(?:No|Number)?:?\s*\d{6,10}\b/i,
    ],
    uniqueIdentifiers: [
      'INGBAU2S', // SWIFT code
      'ING',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    // ING often uses merged amount column with signed values
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    balancePosition: 'right',
    // ING uses negative numbers for debits
    debitIndicators: ['-'],
    creditIndicators: ['+'],
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD MMM YYYY', 'D/M/YYYY'],
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^start\s+balance/i,
      /^balance\s+at\s+start/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^end\s+balance/i,
      /^balance\s+at\s+end/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^date.*description.*amount/i,
      /^ing\.com\.au/i,
      /^orange\s+everyday/i, // Account type
      /^savings\s+maximiser/i, // Account type
    ],
    pageHeaderPatterns: [
      /^account\s+statement/i,
      /^transaction\s+history/i,
    ],
    pageFooterPatterns: [
      /^ing\s+australia/i,
      /^abn\s+\d{2}/i,
    ],
    continuationPatterns: [
      /^\s{6,}/,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};
