/**
 * Banco do Brasil Profile
 * 2nd largest bank in Brazil
 */

import type { BankProfile } from '../types';

export const bbBrazilProfile: BankProfile = {
  id: 'bb-brazil',
  name: 'Banco do Brasil',
  region: 'BR',
  defaultLocale: 'en-US',
  version: '1.0.0',
  lastUpdated: '2025-02-07',

  identification: {
    logoPatterns: ['BANCO DO BRASIL', 'BB', 'bb.com.br', 'Banco do Brasil S.A.'],
    accountPatterns: [/\b\d{8}-\d{1}\b/, /\b\d{5}-\d{1}\b/],
    uniqueIdentifiers: ['BRASBRRJ'],
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
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: 'R$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        currencySymbol: 'R$',
        currencyPosition: 'prefix',
      },
    },
    skipPatterns: [
      /^extrato\s+de\s+conta/i,
      /^agência/i,
      /^conta\s+corrente/i,
      /^página\s+\d+/i,
    ],
    openingBalancePatterns: [/^saldo\s+anterior/i, /^saldo\s+inicial/i],
    closingBalancePatterns: [/^saldo\s+atual/i, /^saldo\s+final/i],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};
