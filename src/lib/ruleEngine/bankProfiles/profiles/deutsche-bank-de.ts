/**
 * Deutsche Bank Profile
 * Deutsche Bank AG - Germany
 */

import type { BankProfile } from '../types';

export const deutscheBankDEProfile: BankProfile = {
  id: 'deutsche-bank-de',
  name: 'Deutsche Bank',
  region: 'DE',
  defaultLocale: 'de-DE',
  version: '1.0.0',
  lastUpdated: '2025-01-24',
  
  identification: {
    logoPatterns: [
      'Deutsche Bank',
      'DEUTSCHE BANK',
      'deutsche-bank.de',
      'DB',
      'Postbank', // Subsidiary
    ],
    accountPatterns: [
      /\bDE\d{20}\b/, // German IBAN
      /\b\d{10}\b/, // German account number
      /\bBLZ\s*:?\s*\d{8}\b/i, // Bank code
    ],
    uniqueIdentifiers: ['DEUTDEFF', 'DEUTDEDB'], // SWIFT codes
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    debitIndicators: ['-', 'S', 'SOLL'], // German for debit
    creditIndicators: ['+', 'H', 'HABEN'], // German for credit
    balancePosition: 'right',
    hasReferenceColumn: false,
    columnHints: {
      date: [0, 12],
      description: [12, 55],
      debit: [55, 70],
      credit: [70, 85],
      balance: [85, 100],
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD.MM.YYYY', 'DD.MM.YY', 'DD/MM/YYYY'],
      dateSeparator: '.',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '€',
      symbolPosition: 'suffix', // German convention: 100,00 €
      negativeFormat: 'minus',
      numberFormat: {
        decimalSeparator: ',', // German decimal separator
        thousandsSeparator: '.', // German thousands separator
        currencySymbol: '€',
        currencyPosition: 'suffix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 4,
    skipPatterns: [
      /^kontoauszug/i, // Statement
      /^umsatzübersicht/i, // Transaction overview
      /^buchungstag/i, // Booking date
      /^wertstellung/i, // Value date
      /^verwendungszweck/i, // Purpose
      /^summe\s+der\s+belastungen/i, // Total debits
      /^summe\s+der\s+gutschriften/i, // Total credits
    ],
    openingBalancePatterns: [
      /^anfangssaldo/i, // Opening balance
      /^alter\s+kontostand/i, // Previous balance
      /^übertrag/i, // Balance brought forward
    ],
    closingBalancePatterns: [
      /^endsaldo/i, // Closing balance
      /^neuer\s+kontostand/i, // New balance
    ],
    pageHeaderPatterns: [
      /^deutsche\s+bank/i,
      /^kontoauszug/i,
      /^iban/i,
    ],
    pageFooterPatterns: [
      /^seite\s+\d+\s+von\s+\d+/i,
      /^deutsche\s+bank\s+ag/i,
    ],
    continuationPatterns: [
      /^ref\s*\.?\s*:?\s*\w+/i,
      /^end-to-end/i,
    ],
  },
};
