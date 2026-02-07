/**
 * UBS Switzerland Profile
 * Swiss banking leader
 */

import type { BankProfile } from '../types';

export const ubsSwitzerlandProfile: BankProfile = {
  id: 'ubs-switzerland',
  name: 'UBS',
  region: 'CH',
  defaultLocale: 'de-DE',
  identification: {
    logoPatterns: ['UBS', 'UBS AG', 'ubs.com', 'UBS SWITZERLAND'],
    accountPatterns: [/\b\d{12}\b/, /\bCH\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{1}\b/],
    uniqueIdentifiers: ['UBSWCHZH', 'UBSW'],
    confidenceThreshold: 0.7,
  },
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['Soll', 'Belastung'],
    creditIndicators: ['Haben', 'Gutschrift'],
    balancePosition: 'right',
    hasReferenceColumn: true,
  },
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD.MM.YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
      dateSeparator: '.',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'CHF',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: 'de-CH',
    },
    skipPatterns: [
      /^kontonummer/i,
      /^iban/i,
      /^bic/i,
      /^kontoauszug/i,
      /^seite\s+\d+/i,
      /^clearing/i,
    ],
    openingBalancePatterns: [
      /^anfangssaldo/i,
      /^saldo\s+vortrag/i,
      /^vorheriger\s+saldo/i,
    ],
    closingBalancePatterns: [
      /^endsaldo/i,
      /^schlusssaldo/i,
      /^aktueller\s+saldo/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
