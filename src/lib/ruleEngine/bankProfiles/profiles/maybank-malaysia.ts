/**
 * Maybank Malaysia Profile
 * Largest bank in Malaysia
 */

import type { BankProfile } from '../types';

export const maybankMalaysiaProfile: BankProfile = {
  id: 'maybank-malaysia',
  name: 'Maybank',
  region: 'MY',
  defaultLocale: 'en-MY',
  identification: {
    logoPatterns: ['MAYBANK', 'MALAYAN BANKING', 'maybank.com.my', 'MAYBANK BERHAD'],
    accountPatterns: [/\b\d{12}\b/, /\b\d{14}\b/],
    uniqueIdentifiers: ['MABORIN', 'MABB'],
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
      numberFormat: 'en-MY',
    },
    skipPatterns: [
      /^nombor\s+akaun/i,
      /^account\s+number/i,
      /^penyata\s+akaun/i,
      /^statement\s+of\s+account/i,
      /^page\s+\d+/i,
      /^muka\s+surat/i,
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
