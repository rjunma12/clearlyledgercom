/**
 * Punjab National Bank (India) Profile
 * Largest public sector bank in India
 */

import type { BankProfile } from '../types';

export const pnbIndiaProfile: BankProfile = {
  id: 'pnb-india',
  name: 'Punjab National Bank',
  region: 'IN',
  defaultLocale: 'en-IN',
  identification: {
    logoPatterns: ['PUNJAB NATIONAL BANK', 'PNB', 'pnbindia.in', 'PUNJAB NATIONAL BANK LTD'],
    accountPatterns: [/\b\d{16}\b/, /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/],
    uniqueIdentifiers: ['PUNBINBB', 'PUNB'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: true,
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
      numberFormat: 'en-IN',
    },
    skipPatterns: [
      /^ifsc\s+code/i,
      /^micr\s+code/i,
      /^branch\s+code/i,
      /^sol\s+id/i,
      /^customer\s+id/i,
      /^cif\s+no/i,
      /^statement\s+of\s+account/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^c\/f/i,
      /^carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
