/**
 * Qatar National Bank (QNB) Profile
 * Largest bank in Qatar and the Middle East
 */

import type { BankProfile } from '../types';

export const qnbQatarProfile: BankProfile = {
  id: 'qnb-qatar',
  name: 'Qatar National Bank',
  region: 'QA',
  defaultLocale: 'en-GB',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['QNB', 'QATAR NATIONAL BANK', 'بنك قطر الوطني', 'qnb.com'],
    accountPatterns: [/\b\d{13}\b/, /\bQA\d{27}\b/],
    uniqueIdentifiers: ['QNBAQAQA'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'QAR',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: 'QAR',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^كشف\s+حساب/i,
      /^رقم\s+الحساب/i,
      /^page\s+\d+/i,
      /^account\s+statement/i,
    ],
    openingBalancePatterns: [/^الرصيد\s+الافتتاحي/i, /^opening\s+balance/i],
    closingBalancePatterns: [/^الرصيد\s+الختامي/i, /^closing\s+balance/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};
