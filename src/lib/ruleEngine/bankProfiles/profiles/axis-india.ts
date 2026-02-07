/**
 * Axis Bank (India) Profile
 * 3rd largest private sector bank in India
 */

import type { BankProfile } from '../types';

export const axisIndiaProfile: BankProfile = {
  id: 'axis-india',
  name: 'Axis Bank',
  region: 'IN',
  defaultLocale: 'en-IN',
  identification: {
    logoPatterns: ['AXIS BANK', 'Axis Bank Ltd', 'axisbank.com', 'AXIS BANK LIMITED'],
    accountPatterns: [/\b\d{15}\b/, /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{3}\b/],
    uniqueIdentifiers: ['AXISINBB', 'UTIB'],
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
    },
    skipPatterns: [
      /^ifsc\s+code/i,
      /^micr\s+code/i,
      /^branch\s+code/i,
      /^customer\s+id/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^b\/f/i,
      /^brought\s+forward/i,
      /^op\.?\s*bal/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^c\/f/i,
      /^carried\s+forward/i,
      /^cl\.?\s*bal/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
