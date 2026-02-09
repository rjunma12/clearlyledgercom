/**
 * Citizens Bank US Profile
 * Major Northeast regional bank
 */

import type { BankProfile } from '../types';

export const citizensUsProfile: BankProfile = {
  id: 'citizens-us',
  name: 'Citizens Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['CITIZENS BANK', 'CITIZENS', 'citizensbank.com', 'CITIZENS FINANCIAL'],
    accountPatterns: [/\b\d{10,13}\b/],
    uniqueIdentifiers: ['CTZIUS33', 'CITIZENS'],
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
      /^one\s+deposit/i,
      /^citizens\s+access/i,
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
