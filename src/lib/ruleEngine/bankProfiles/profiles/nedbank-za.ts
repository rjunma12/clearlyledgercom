/**
 * Nedbank South Africa Profile
 * 4th largest bank in South Africa
 */

import type { BankProfile } from '../types';

export const nedbankZaProfile: BankProfile = {
  id: 'nedbank-za',
  name: 'Nedbank',
  region: 'ZA',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['NEDBANK', 'nedbank.co.za', 'NEDBANK LIMITED'],
    accountPatterns: [/\b\d{10,11}\b/],
    uniqueIdentifiers: ['NEDSZAJJ', 'NEDS'],
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
      dateFormats: ['DD/MM/YYYY', 'YYYY/MM/DD', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'R',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^branch\s+code/i,
      /^statement\s+period/i,
      /^swift\s+code/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^available\s+balance/i,
      /^carried\s+forward/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
