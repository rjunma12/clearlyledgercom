/**
 * National Australia Bank (NAB) Profile
 * One of Australia's "Big Four" banks
 */

import { BankProfile } from '../types';

export const nabAustraliaProfile: BankProfile = {
  id: 'nab-australia',
  name: 'National Australia Bank',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'NAB',
      'National Australia Bank',
      'nab.com.au',
      'NATIONAL AUSTRALIA BANK',
      'UBank', // Subsidiary
    ],
    accountPatterns: [
      /\b\d{3}-\d{3}\s*\d{6,10}\b/,
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      /\bAccount\s*(?:No|Number)?:?\s*\d{6,10}\b/i,
    ],
    uniqueIdentifiers: [
      'NATAAU33', // SWIFT code
      'NAB',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    // NAB uses "Withdrawals" and "Deposits" column headers
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    // These will help map NAB's column headers
    debitIndicators: ['DR', '-', 'Withdrawal', 'Withdrawals'],
    creditIndicators: ['CR', '+', 'Deposit', 'Deposits'],
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY', 'DD MMM YYYY', 'D/M/YYYY'],
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
    },
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^previous\s+statement\s+balance/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^statement\s+balance/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^date.*description.*withdrawals.*deposits/i,
      /^nab\.com\.au/i,
      /^internet\s+banking/i,
    ],
    pageHeaderPatterns: [
      /^account\s+statement/i,
      /^transaction\s+listing/i,
      /^account\s+activity/i,
    ],
    pageFooterPatterns: [
      /^national\s+australia\s+bank/i,
      /^abn\s+\d{2}/i,
    ],
    continuationPatterns: [
      /^\s{8,}/,
      /^[a-z]/,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 2,
  },
};
