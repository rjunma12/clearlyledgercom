/**
 * HDFC Bank (India) Profile
 * Housing Development Finance Corporation Limited
 */

import type { BankProfile } from '../types';

export const hdfcIndiaProfile: BankProfile = {
  id: 'hdfc-india',
  name: 'HDFC Bank',
  region: 'IN',
  defaultLocale: 'en-IN',
  version: '1.0.0',
  lastUpdated: '2025-01-22',
  
  identification: {
    logoPatterns: [
      'HDFC BANK',
      'HDFC Bank Ltd',
      'hdfcbank.com',
      'Housing Development Finance',
    ],
    accountPatterns: [
      /\b\d{14}\b/, // 14-digit account number
      /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{2}\b/,
    ],
    uniqueIdentifiers: ['HDFCINBB'], // SWIFT code
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false, // HDFC has separate columns
    balancePosition: 'right',
    hasReferenceColumn: true, // HDFC includes Cheque/Ref No
    columnHints: {
      date: [0, 12],
      description: [12, 50],
      debit: [50, 65],
      credit: [65, 80],
      balance: [80, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD/MM/YY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '₹',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '₹',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
    skipPatterns: [
      /^statement\s+of\s+account/i,
      /^account\s+statement/i,
      /^nomination\s+registered/i,
      /^interest\s+rate/i,
      /^branch\s+name/i,
      /^ifsc\s+code/i,
      /^customer\s+id/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^b\/f\s+balance/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^c\/f\s+balance/i,
      /^carried\s+forward/i,
    ],
    pageHeaderPatterns: [
      /^hdfc\s+bank/i,
      /^statement\s+of\s+account/i,
    ],
    pageFooterPatterns: [
      /^this\s+is\s+a\s+computer/i,
      /^does\s+not\s+require/i,
    ],
    continuationPatterns: [
      /^ref\s*:?\s*\d+/i,
      /^utr\s*:?\s*\d+/i,
      /^imps\s*:?\s*\d+/i,
      /^neft\s*:?\s*\d+/i,
    ],
  },
};
