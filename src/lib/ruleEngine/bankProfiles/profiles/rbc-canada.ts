/**
 * RBC Royal Bank (Canada) Profile
 * Largest bank in Canada
 */

import type { BankProfile } from '../types';

export const rbcCanadaProfile: BankProfile = {
  id: 'rbc-canada',
  name: 'RBC Royal Bank',
  region: 'CA',
  defaultLocale: 'en-US',
  identification: {
    logoPatterns: ['RBC', 'ROYAL BANK', 'Royal Bank of Canada', 'rbc.com', 'RBC ROYAL BANK'],
    accountPatterns: [/\b\d{7}\b/, /\b\d{5}-\d{7}\b/],
    uniqueIdentifiers: ['ROYCCAT2', 'ROYC'],
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
      dateFormats: ['MMM DD, YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'],
      dateSeparator: '-',
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      numberFormat: 'en-US',
    },
    skipPatterns: [
      /^account\s+number/i,
      /^transit\s+number/i,
      /^institution\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^branch\s+address/i,
    ],
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^previous\s+balance/i,
      /^balance\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^ending\s+balance/i,
      /^current\s+balance/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
  version: '1.0.0',
  lastUpdated: '2025-02-07',
};
