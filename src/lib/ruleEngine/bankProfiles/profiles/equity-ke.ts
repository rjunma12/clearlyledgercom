/**
 * Equity Bank Kenya Profile
 * East Africa's leading bank
 */

import type { BankProfile } from '../types';

export const equityKeProfile: BankProfile = {
  id: 'equity-ke',
  name: 'Equity Bank',
  region: 'KE',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['EQUITY BANK', 'equitybankgroup.com', 'EQUITY GROUP'],
    accountPatterns: [/\b\d{13}\b/],
    uniqueIdentifiers: ['EABORIN', 'EQBL'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'KSh',
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
      /^brought\s+forward/i,
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
