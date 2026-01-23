/**
 * Commonwealth Bank of Australia (CBA) Bank Profile
 * Australia's largest retail bank
 */

import { BankProfile } from '../types';

export const cbaAustraliaProfile: BankProfile = {
  id: 'cba-australia',
  name: 'Commonwealth Bank of Australia',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'Commonwealth Bank',
      'CommBank',
      'CBA',
      'commbank.com.au',
      'COMMONWEALTH BANK OF AUSTRALIA',
      'Commonwealth Bank of Australia',
    ],
    accountPatterns: [
      // BSB-Account format: XXX-XXX XXXXXXXX
      /\b\d{3}-\d{3}\s*\d{8,10}\b/,
      // BSB only
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      // Account number
      /\bAccount\s*(?:No|Number)?:?\s*\d{8,10}\b/i,
    ],
    uniqueIdentifiers: [
      'CTBAAU2S', // SWIFT code
      'CBA',
      'CommBank',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['DD MMM YYYY', 'DD/MM/YYYY', 'D MMM YYYY', 'DD MMM YY'],
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
      /^b\/f/i,
      /^brought\s+forward/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^c\/f/i,
      /^carried\s+forward/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^transaction\s+details/i,
      /^date.*description.*amount/i,
      /^commbank\.com\.au/i,
    ],
    pageHeaderPatterns: [
      /^transaction\s+history/i,
      /^account\s+statement/i,
      /^statement\s+of\s+account/i,
    ],
    pageFooterPatterns: [
      /^commonwealth\s+bank\s+of\s+australia/i,
      /^abn\s+\d{2}/i,
      /^continued\s+on\s+next\s+page/i,
    ],
    continuationPatterns: [
      /^\s{10,}/, // Lines starting with significant whitespace
      /^[a-z]/, // Lines starting with lowercase (continuation)
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
};
