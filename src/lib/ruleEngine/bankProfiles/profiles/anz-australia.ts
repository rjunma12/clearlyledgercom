/**
 * ANZ Bank Australia Profile
 * Australia and New Zealand Banking Group
 */

import { BankProfile } from '../types';

export const anzAustraliaProfile: BankProfile = {
  id: 'anz-australia',
  name: 'ANZ Bank Australia',
  region: 'AU',
  defaultLocale: 'en-AU',
  version: '1.0.0',
  lastUpdated: '2025-01-23',
  
  identification: {
    logoPatterns: [
      'ANZ',
      'ANZ Bank',
      'Australia and New Zealand Banking Group',
      'anz.com.au',
      'ANZ Banking Group',
    ],
    accountPatterns: [
      // BSB-Account format
      /\b\d{3}-\d{3}\s*\d{6,10}\b/,
      /\bBSB:?\s*\d{3}-?\d{3}\b/i,
      /\bAccount:?\s*\d{6,10}\b/i,
    ],
    uniqueIdentifiers: [
      'ANZBAU3M', // SWIFT code
      'ANZ',
    ],
    confidenceThreshold: 0.7,
  },

  columnConfig: {
    // ANZ often uses merged debit/credit with DR/CR indicators
    columnOrder: 'date-desc-amount-balance',
    mergedDebitCredit: true,
    balancePosition: 'right',
    debitIndicators: ['DR', 'D', '-', 'Debit'],
    creditIndicators: ['CR', 'C', '+', 'Credit'],
  },

  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD/MM/YY', 'DD MMM YYYY', 'DD MMM'],
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
      /^previous\s+balance/i,
    ],
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^balance\s+carried\s+forward/i,
      /^current\s+balance/i,
    ],
    skipPatterns: [
      /^bsb/i,
      /^account\s+number/i,
      /^statement\s+period/i,
      /^page\s+\d+/i,
      /^date.*particulars.*debit.*credit/i,
      /^anz\.com\.au/i,
      /^internet\s+banking/i,
    ],
    pageHeaderPatterns: [
      /^account\s+statement/i,
      /^transaction\s+listing/i,
      /^statement\s+details/i,
    ],
    pageFooterPatterns: [
      /^australia\s+and\s+new\s+zealand\s+banking/i,
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
