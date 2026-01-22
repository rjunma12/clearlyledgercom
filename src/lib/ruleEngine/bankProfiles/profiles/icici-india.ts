/**
 * ICICI Bank (India) Profile
 * Industrial Credit and Investment Corporation of India
 */

import type { BankProfile } from '../types';

export const iciciIndiaProfile: BankProfile = {
  id: 'icici-india',
  name: 'ICICI Bank',
  region: 'IN',
  defaultLocale: 'en-IN',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [
      'ICICI BANK',
      'ICICI Bank Ltd',
      'icicibank.com',
      'Industrial Credit',
    ],
    accountPatterns: [
      /\b\d{12}\b/, // 12-digit account number
    ],
    uniqueIdentifiers: ['ABORINBB'], // SWIFT code
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: true,
    columnHints: {
      date: [0, 10],
      description: [10, 50],
      debit: [50, 65],
      credit: [65, 80],
      balance: [80, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY', 'DD-MMM-YYYY'],
      dateSeparator: '-',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '₹',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '₹',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^account\s+statement/i,
      /^statement\s+of\s+account/i,
      /^branch\s+name/i,
      /^account\s+type/i,
      /^customer\s+id/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+c\/f/i,
    ],
    pageHeaderPatterns: [
      /^icici\s+bank/i,
    ],
    pageFooterPatterns: [
      /^this\s+is\s+a\s+system/i,
      /^computer\s+generated/i,
    ],
    continuationPatterns: [
      /^utr\s*:?\s*\d+/i,
      /^imps\s*:?\s*\d+/i,
      /^ref\s*no\s*:?\s*\d+/i,
    ],
  },
};
