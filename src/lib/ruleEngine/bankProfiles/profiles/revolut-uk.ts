/**
 * Revolut UK Profile
 * Fintech leader
 */

import type { BankProfile } from '../types';

export const revolutUkProfile: BankProfile = {
  id: 'revolut-uk',
  name: 'Revolut',
  region: 'UK',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['REVOLUT', 'revolut.com', 'REVOLUT LTD'],
    accountPatterns: [/\b\d{8}\b/, /\bGB\d{20}\b/],
    uniqueIdentifiers: ['REVOGB21', 'REVO'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-'],
    creditIndicators: ['+'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD MMM YYYY', 'YYYY-MM-DD'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '£',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^iban/i,
      /^bic/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^starting\s+balance/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ending\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
