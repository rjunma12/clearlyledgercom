/**
 * CIMB Malaysia Profile
 * Major Malaysian bank
 */

import type { BankProfile } from '../types';

export const cimbMalaysiaProfile: BankProfile = {
  id: 'cimb-malaysia',
  name: 'CIMB Bank',
  region: 'MY',
  defaultLocale: 'ms-MY',
  identification: {
    logoPatterns: ['CIMB', 'CIMB BANK', 'cimb.com.my', 'CIMB GROUP'],
    accountPatterns: [/\b\d{10}\b/, /\b\d{14}\b/],
    uniqueIdentifiers: ['CIBBMYKL', 'CIBB'],
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
      dateFormats: ['DD/MM/YYYY', 'DD MMM YYYY', 'DD-MM-YYYY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: 'RM',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    skipPatterns: [
      /^nombor\s+akaun/i,
      /^account\s+number/i,
      /^penyata\s+akaun/i,
      /^statement\s+of\s+account/i,
      /^page\s+\d+/i,
    ],
    openingBalancePatterns: [
      /^baki\s+bawa/i,
      /^opening\s+balance/i,
      /^balance\s+b\/f/i,
    ],
    closingBalancePatterns: [
      /^baki\s+akhir/i,
      /^closing\s+balance/i,
      /^balance\s+c\/f/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
