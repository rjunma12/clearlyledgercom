/**
 * Morgan Stanley Bank US Profile
 * Investment bank with unique statement format
 */

import type { BankProfile } from '../types';

export const morganStanleyUsProfile: BankProfile = {
  id: 'morgan-stanley-us',
  name: 'Morgan Stanley Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['MORGAN STANLEY', 'MS BANK', 'morganstanley.com', 'E*TRADE'],
    accountPatterns: [/\b\d{10,12}\b/, /\b[A-Z]{2}\d{8}\b/],
    uniqueIdentifiers: ['MSTCUS33', 'MSBANK'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit', 'Withdrawal'],
    creditIndicators: ['+', 'CR', 'Credit', 'Deposit'],
    balancePosition: 'right',
    hasReferenceColumn: true,
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
      negativeFormat: 'parentheses',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^routing\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^portfolio\s+value/i,
      /^securities\s+held/i,
      /^brokerage\s+account/i,
      /^investment\s+summary/i,
      /^market\s+value/i,
    ],
    openingBalancePatterns: [
      /^beginning\s+balance/i,
      /^previous\s+balance/i,
      /^opening\s+value/i,
    ],
    closingBalancePatterns: [
      /^ending\s+balance/i,
      /^current\s+balance/i,
      /^closing\s+value/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};
