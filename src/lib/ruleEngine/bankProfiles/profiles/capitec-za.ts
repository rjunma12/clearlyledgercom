/**
 * Capitec Bank South Africa Profile
 * Fastest growing bank in South Africa
 */

import type { BankProfile } from '../types';

export const capitecZaProfile: BankProfile = {
  id: 'capitec-za',
  name: 'Capitec Bank',
  region: 'ZA',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['CAPITEC', 'CAPITEC BANK', 'capitecbank.co.za'],
    accountPatterns: [/\b\d{10}\b/],
    uniqueIdentifiers: ['CABORIN', 'CPZA'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: false,
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
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^available\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
