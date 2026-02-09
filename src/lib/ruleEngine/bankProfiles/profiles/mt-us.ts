/**
 * M&T Bank US Profile
 * Major Northeast regional bank
 */

import type { BankProfile } from '../types';

export const mtUsProfile: BankProfile = {
  id: 'mt-us',
  name: 'M&T Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['M&T BANK', 'M&T', 'mtb.com', 'MANUFACTURERS AND TRADERS'],
    accountPatterns: [/\b\d{10,13}\b/],
    uniqueIdentifiers: ['MANTUS33', 'MTBANK'],
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
      /^understanding\s+money/i,
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
