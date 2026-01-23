/**
 * Macquarie Bank Australia Profile
 * Investment and business banking focus
 */

import { BankProfile } from '../types';

export const macquarieAustraliaProfile: BankProfile = {
  id: 'macquarie-australia',
  name: 'Macquarie Bank',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'Macquarie',
      'Macquarie Bank',
      'macquarie.com.au',
      'MACQUARIE BANK',
      'Macquarie Group',
    ],
    accountPatterns: [
      /\b\d{3}-\d{3}\s*\d{6,10}\b/,
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      /\bAccount\s*(?:No|Number)?:?\s*\d{6,10}\b/i,
      /\bCMA\s*\d+/i, // Cash Management Account
    ],
    uniqueIdentifiers: [
      'MACQAU2S', // SWIFT code
      'Macquarie',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false,
    balancePosition: 'right',
    debitIndicators: ['DR', '-', 'D'],
    creditIndicators: ['CR', '+', 'C'],
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD MMM YYYY', 'DD-MMM-YYYY'],
      yearFormat: '4-digit',
    },
    amountFormatting: {
      currencySymbol: '$',
      symbolPosition: 'prefix',
      negativeFormat: 'parentheses', // Macquarie sometimes uses (1,234.56)
    },
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^balance\s+brought\s+forward/i,
      /^previous\s+closing\s+balance/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^statement\s+closing\s+balance/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^date.*transaction.*debit.*credit/i,
      /^macquarie\.com\.au/i,
      /^cash\s+management\s+account/i,
      /^transaction\s+reference/i,
    ],
    pageHeaderPatterns: [
      /^account\s+statement/i,
      /^transaction\s+statement/i,
      /^cma\s+statement/i,
    ],
    pageFooterPatterns: [
      /^macquarie\s+bank/i,
      /^abn\s+\d{2}/i,
      /^afsl\s+\d+/i, // Australian Financial Services License
    ],
    continuationPatterns: [
      /^\s{8,}/,
      /^ref:?\s/i,
      /^reference:?\s/i,
    ],
    multiLineDescriptions: true,
    maxDescriptionLines: 3,
  },
};
