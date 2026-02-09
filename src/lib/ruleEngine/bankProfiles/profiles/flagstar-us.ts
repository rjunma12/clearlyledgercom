/**
 * Flagstar Bank US Profile
 * Mortgage specialist
 */

import type { BankProfile } from '../types';

export const flagstarUsProfile: BankProfile = {
  id: 'flagstar-us',
  name: 'Flagstar Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['FLAGSTAR', 'FLAGSTAR BANK', 'flagstar.com'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['FLGSUS33', 'FLGSTR'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit'],
    creditIndicators: ['+', 'CR', 'Credit'],
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['MM/DD/YYYY', 'MM-DD-YYYY', 'MMM DD, YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^routing\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^mortgage\s+payment/i,
      /^escrow\s+balance/i,
      /^loan\s+number/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};
