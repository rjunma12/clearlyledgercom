/**
 * KBC Bank Belgium Profile
 * Largest Belgian bank
 */

import type { BankProfile } from '../types';

export const kbcBeProfile: BankProfile = {
  id: 'kbc-be',
  name: 'KBC Bank',
  region: 'BE',
  defaultLocale: 'en-GB',
  identification: {
    logoPatterns: ['KBC', 'KBC BANK', 'kbc.be', 'KBC GROEP'],
    accountPatterns: [/\bBE\d{14}\b/, /\b\d{3}-\d{7}-\d{2}\b/],
    uniqueIdentifiers: ['KREDBEBB', 'KRED'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
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
      /^rekeninguitreksel/i,
      /^extrait\s+de\s+compte/i,
      /^iban/i,
      /^pagina\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^beginsaldo/i,
      /^solde\s+précédent/i,
    ],
    closingBalancePatterns: [
      /^eindsaldo/i,
      /^solde\s+final/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
