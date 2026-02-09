/**
 * Synchrony Bank US Profile
 * Card issuer / retail banking
 */

import type { BankProfile } from '../types';

export const synchronyUsProfile: BankProfile = {
  id: 'synchrony-us',
  name: 'Synchrony Bank',
  region: 'US',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['SYNCHRONY', 'SYNCHRONY BANK', 'synchrony.com', 'SYNCHRONY FINANCIAL'],
    accountPatterns: [/\b\d{16}\b/, /\b\d{10,12}\b/],
    uniqueIdentifiers: ['SYCBUS33', 'SYNCBNK'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    debitIndicators: ['-', 'DR', 'Debit', 'Purchase', 'Fee'],
    creditIndicators: ['+', 'CR', 'Credit', 'Payment', 'Refund'],
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
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^annual\s+percentage\s+rate/i,
      /^apr/i,
      /^interest\s+charge/i,
      /^minimum\s+payment/i,
      /^payment\s+due\s+date/i,
      /^credit\s+limit/i,
      /^available\s+credit/i,
      /^promotional\s+balance/i,
    ],
    openingBalancePatterns: [
      /^previous\s+balance/i,
      /^prior\s+balance/i,
    ],
    closingBalancePatterns: [
      /^new\s+balance/i,
      /^current\s+balance/i,
      /^statement\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-09',
};
