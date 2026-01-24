/**
 * TD Bank (Canada) Profile
 * Toronto-Dominion Bank - Canada
 */

import type { BankProfile } from '../types';

export const tdCanadaProfile: BankProfile = {
  id: 'td-canada',
  name: 'TD Bank',
  region: 'CA',
  defaultLocale: 'en-US', // Canada uses similar date formats
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'TD Bank',
      'TD Canada Trust',
      'TD',
      'td.com',
      'Toronto-Dominion',
      'TDCT',
    ],
    accountPatterns: [
      /\b\d{5}[\s-]?\d{7}\b/, // TD account format
      /\bTransit\s*#?\s*\d{5}\b/i,
    ],
    uniqueIdentifiers: ['TDOMCATTTOR', 'TDOMCATT'], // SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'DR', 'DEBIT'],
    creditIndicators: ['+', 'CR', 'CREDIT'],
    balancePosition: 'right',
    hasReferenceColumn: false,
    columnHints: {
      date: [0, 12],
      description: [12, 55],
      debit: [55, 70],
      credit: [70, 85],
      balance: [85, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['MMM DD, YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '$',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^account\s+summary/i,
      /^transaction\s+details/i,
      /^account\s+activity/i,
      /^total\s+withdrawals/i,
      /^total\s+deposits/i,
      /^interac\s+e-transfer/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^previous\s+balance/i,
      /^balance\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ending\s+balance/i,
    ],
    pageHeaderPatterns: [
      /^td\s+bank/i,
      /^td\s+canada\s+trust/i,
      /^statement\s+of\s+account/i,
    ],
    pageFooterPatterns: [
      /^page\s+\d+\s+of\s+\d+/i,
      /^member\s+of\s+cdic/i,
    ],
    continuationPatterns: [
      /^ref\s*#?\s*\d+/i,
      /^confirmation\s*#?\s*\d+/i,
    ],
  },
};
