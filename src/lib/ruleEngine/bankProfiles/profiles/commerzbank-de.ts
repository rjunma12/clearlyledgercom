/**
 * Commerzbank Germany Profile
 * 2nd largest German bank
 */

import type { BankProfile } from '../types';

export const commerzbankDeProfile: BankProfile = {
  id: 'commerzbank-de',
  name: 'Commerzbank',
  region: 'DE',
  defaultLocale: 'de-DE',
  identification: {
    logoPatterns: ['COMMERZBANK', 'commerzbank.de', 'COMMERZBANK AG'],
    accountPatterns: [/\bDE\d{20}\b/, /\b\d{8}\s*\d{10}\b/],
    uniqueIdentifiers: ['COBADEXX', 'COBA'],
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
