/**
 * Attijariwafa Bank Morocco Profile
 * North Africa's leading bank
 */

import type { BankProfile } from '../types';

export const attijariwafaMaProfile: BankProfile = {
  id: 'attijariwafa-ma',
  name: 'Attijariwafa Bank',
  region: 'MA',
  defaultLocale: 'fr-FR',
  identification: {
    logoPatterns: ['ATTIJARIWAFA', 'attijariwafabank.com', 'التجاري وفا بنك'],
    accountPatterns: [/\b\d{16,24}\b/],
    uniqueIdentifiers: ['BCMAMAMC', 'BCMA'],
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
      currencySymbol: 'DH',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: 'DH',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^numéro\s+de\s+compte/i,
      /^relevé\s+de\s+compte/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^solde\s+précédent/i,
      /^solde\s+initial/i,
      /^opening\s+balance/i,
    ],
    closingBalancePatterns: [
      /^solde\s+actuel/i,
      /^solde\s+final/i,
      /^closing\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
