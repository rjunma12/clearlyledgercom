/**
 * ADCB Abu Dhabi Commercial Bank (UAE) Profile
 * Major UAE bank
 */

import type { BankProfile } from '../types';

export const adcbUaeProfile: BankProfile = {
  id: 'adcb-uae',
  name: 'ADCB',
  region: 'AE',
  defaultLocale: 'en-AE',
  identification: {
    logoPatterns: ['ADCB', 'ABU DHABI COMMERCIAL BANK', 'adcb.com', 'ADCB GROUP'],
    accountPatterns: [/\b\d{13}\b/, /\bAE\d{2}\s*\d{4}\s*\d{16}\b/],
    uniqueIdentifiers: ['ADCBAEAA', 'ADCB'],
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
      dateFormats: ['DD/MM/YYYY', 'DD-MMM-YYYY', 'DD MMM YYYY'],
      dateSeparator: '/',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: 'AED',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: 'en-AE',
    },
    skipPatterns: [
      /^رقم\s+الحساب/i,
      /^account\s+number/i,
      /^كشف\s+حساب/i,
      /^statement\s+of\s+account/i,
      /^page\s+\d+/i,
      /^iban/i,
    ],
    openingBalancePatterns: [
      /^الرصيد\s+الافتتاحي/i,
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
    ],
    closingBalancePatterns: [
      /^الرصيد\s+الختامي/i,
      /^closing\s+balance/i,
      /^balance\s+c\/f/i,
      /^available\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
