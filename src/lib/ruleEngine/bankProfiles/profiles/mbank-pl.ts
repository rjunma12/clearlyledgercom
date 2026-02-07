/**
 * mBank Poland Profile
 * Digital leader in Poland
 */

import type { BankProfile } from '../types';

export const mbankPlProfile: BankProfile = {
  id: 'mbank-pl',
  name: 'mBank',
  region: 'PL',
  defaultLocale: 'pl-PL',
  identification: {
    logoPatterns: ['MBANK', 'mbank.pl', 'MBANK S.A.'],
    accountPatterns: [/\bPL\d{26}\b/, /\b\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/],
    uniqueIdentifiers: ['BREXPLPW', 'BREX'],
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
      currencySymbol: 'zł',
      symbolPosition: 'suffix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: ' ',
        currencySymbol: 'zł',
        currencyPosition: 'suffix',
      },
    },
    skipPatterns: [
      /^wyciąg\s+z\s+konta/i,
      /^iban/i,
      /^numer\s+rachunku/i,
      /^strona\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^saldo\s+początkowe/i,
      /^saldo\s+otwarcia/i,
    ],
    closingBalancePatterns: [
      /^saldo\s+końcowe/i,
      /^saldo\s+zamknięcia/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
