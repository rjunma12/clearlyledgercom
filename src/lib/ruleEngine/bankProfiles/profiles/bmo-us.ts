/**
 * BMO USA Profile
 * Canadian bank, US operations
 */

import type { BankProfile } from '../types';

export const bmoUsProfile: BankProfile = {
  id: 'bmo-us',
  name: 'BMO Bank (US)',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['BMO', 'BMO HARRIS', 'BMO BANK', 'bmoharris.com', 'bmo.com'],
    accountPatterns: [/\b\d{10,12}\b/],
    uniqueIdentifiers: ['HATRUS44', 'BMOUSA'],
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
      /^make\s+money\s+make\s+sense/i,
      /^bmo\s+rewards/i,
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
