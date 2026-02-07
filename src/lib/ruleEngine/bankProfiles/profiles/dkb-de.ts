/**
 * DKB Bank Germany Profile
 * Direct bank
 */

import type { BankProfile } from '../types';

export const dkbDeProfile: BankProfile = {
  id: 'dkb-de',
  name: 'DKB Bank',
  region: 'DE',
  defaultLocale: 'de-DE',
  identification: {
    logoPatterns: ['DKB', 'DEUTSCHE KREDITBANK', 'dkb.de', 'DKB AG'],
    accountPatterns: [/\bDE\d{20}\b/],
    uniqueIdentifiers: ['BYLADEM1', 'BYLA'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    hasReferenceColumn: false,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD.MM.YYYY', 'DD-MM-YYYY'],
      dateSeparator: '.',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: '€',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^kontoauszug/i,
      /^iban/i,
      /^bic/i,
      /^seite\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^alter\s+kontostand/i,
      /^anfangssaldo/i,
    ],
    closingBalancePatterns: [
      /^neuer\s+kontostand/i,
      /^endsaldo/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
