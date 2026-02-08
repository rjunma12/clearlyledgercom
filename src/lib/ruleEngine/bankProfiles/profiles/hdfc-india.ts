/**
 * HDFC Bank (India) Profile
 * Housing Development Finance Corporation Limited
 * 
 * Enhanced for accurate PDF-to-Excel conversion with:
 * - Precise column hints for HDFC statement layout
 * - Comprehensive skip patterns for footer/disclaimer content
 * - Multi-line description stitching patterns
 */

import type { BankProfile } from '../types';

export const hdfcIndiaProfile: BankProfile = {
  id: 'hdfc-india',
  name: 'HDFC Bank',
  region: 'IN',
  defaultLocale: 'en-IN',
  version: '2.0.0',
  lastUpdated: '2025-02-08',
  
  identification: {
    logoPatterns: [
      'HDFC BANK',
      'HDFC Bank Ltd',
      'hdfcbank.com',
      'Housing Development Finance',
      'HDFC BANK LTD',
      'HDFC Bank Limited',
    ],
    accountPatterns: [
      /\b\d{14}\b/, // 14-digit account number
      /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{2}\b/,
      /\b\d{4}\s*X{4}\s*X{4}\s*\d{2}\b/, // Masked format
      /\bXX\d{4}\b/, // Short masked format (XX5055)
    ],
    uniqueIdentifiers: ['HDFCINBB', 'HDFC0'], // SWIFT code and IFSC prefix
    confidenceThreshold: 0.7,
  },
  
  columnConfig: {
    columnOrder: 'date-desc-debit-credit-balance',
    mergedDebitCredit: false, // HDFC has separate columns
    balancePosition: 'right',
    hasReferenceColumn: true, // HDFC includes Cheque/Ref No
    // Enhanced column hints with actual HDFC PDF measurements (percentage-based)
    columnHints: {
      date: [0, 12],           // First 12% - Date column
      description: [12, 58],   // 12-58% - Narration/Description + Ref + Value Date
      debit: [58, 72],         // 58-72% - Withdrawal Amt.
      credit: [72, 86],        // 72-86% - Deposit Amt.
      balance: [86, 100],      // 86-100% - Closing Balance
    },
  },
  
  specialRules: {
    dateFormatting: {
      dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD/MM/YY', 'DD-MMM-YYYY'],
      dateSeparator: '/',
      yearFormat: 'both',
    },
    amountFormatting: {
      currencySymbol: '₹',
      symbolPosition: 'prefix',
      negativeFormat: 'minus',
      // Support for Indian lakh/crore format
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        currencySymbol: '₹',
        currencyPosition: 'prefix',
      },
    },
    multiLineDescriptions: true,
    maxDescriptionLines: 4, // HDFC often has 3-4 line descriptions
    
    // Comprehensive skip patterns for HDFC statements
    skipPatterns: [
      // Header patterns
      /^statement\s+of\s+account/i,
      /^account\s+statement/i,
      /^nomination\s+registered/i,
      /^interest\s+rate/i,
      /^branch\s+name/i,
      /^ifsc\s+code/i,
      /^customer\s+id/i,
      /^cust\.?\s*id/i,
      /^a\/c\s*type/i,
      /^account\s+type/i,
      /^currency\s*:/i,
      /^joint\s+holder/i,
      
      // Column headers
      /^date\s+narration/i,
      /^date\s+particulars/i,
      /^value\s*dt/i,
      /^chq\.?\s*\/?\s*ref/i,
      /^withdrawal\s+amt/i,
      /^deposit\s+amt/i,
      /^closing\s+balance/i,
      
      // Footer/disclaimer patterns
      /^this\s+is\s+a\s+(computer|system)/i,
      /^does\s+not\s+require/i,
      /^toll\s*free/i,
      /^customer\s+care/i,
      /^regd\.?\s*office/i,
      /^cin\s*[:.-]/i,
      /^gstin/i,
      /^gst\s*no/i,
      /^for\s+any\s+(queries?|complaints?)/i,
      /^please\s+contact/i,
      /^helpline/i,
      /^\d{3,4}[-\s]\d{3,4}[-\s]\d{3,4}/i, // Phone numbers
      /^1800[-\s]\d+/i, // Toll-free numbers
      /^www\.hdfcbank/i,
      /^hdfcbank\.com/i,
      
      // Address patterns
      /^head\s+office/i,
      /^corporate\s+office/i,
      /^registered\s+office/i,
      /^\d+[,\s]+floor/i,
      /^mumbai\s*[-,]/i,
      
      // Page markers
      /^page\s*\d+\s*(of\s*\d+)?/i,
      /^contd\.?/i,
      /^continued/i,
    ],
    
    openingBalancePatterns: [
      /^opening\s+balance/i,
      /^b\/f\s+balance/i,
      /^brought\s+forward/i,
      /^balance\s+b\/f/i,
      /^op\.?\s*bal/i,
    ],
    
    closingBalancePatterns: [
      /^closing\s+balance/i,
      /^c\/f\s+balance/i,
      /^carried\s+forward/i,
      /^balance\s+c\/f/i,
      /^cl\.?\s*bal/i,
    ],
    
    pageHeaderPatterns: [
      /^hdfc\s+bank/i,
      /^statement\s+of\s+account/i,
      /^account\s+statement/i,
    ],
    
    pageFooterPatterns: [
      /^this\s+is\s+a\s+computer/i,
      /^does\s+not\s+require/i,
      /^toll\s*free/i,
      /^page\s*\d+/i,
    ],
    
    // Enhanced continuation patterns for multi-line stitching
    continuationPatterns: [
      // Transaction reference patterns
      /^ref\s*[:\-]?\s*\d+/i,
      /^utr\s*[:\-]?\s*[A-Z0-9]+/i,
      /^imps\s*[:\-]?\s*\d+/i,
      /^neft\s*[:\-]?\s*[A-Z0-9]+/i,
      /^rtgs\s*[:\-]?\s*[A-Z0-9]+/i,
      /^txn\s*id\s*[:\-]?\s*[A-Z0-9]+/i,
      /^trans\s*id\s*[:\-]?\s*[A-Z0-9]+/i,
      /^transaction\s+id\s*[:\-]?\s*\d+/i,
      /^arn\s*[:\-]?\s*[A-Z0-9]+/i, // Acquirer Reference Number
      
      // Beneficiary/Payer patterns (common in UPI/NEFT descriptions)
      /^to\s+[A-Z]/i,
      /^from\s+[A-Z]/i,
      /^paid\s+to\s+/i,
      /^received\s+from\s+/i,
      /^beneficiary\s*[:\-]/i,
      /^payer\s*[:\-]/i,
      
      // UPI-specific patterns
      /^upi\s*[:\-]/i,
      /^[A-Z0-9]+@[a-z]+/i, // UPI ID pattern (xxx@upi)
      
      // Card/ATM patterns
      /^atm\s*[:\-]/i,
      /^card\s+no\s*[:\-]/i,
      /^pos\s*[:\-]/i,
      
      // Location/merchant patterns (continuation of ATM/POS transactions)
      /^[A-Z]{2,}\s+[A-Z]{2}$/i, // City code + state (e.g., "MUMBAI MH")
    ],
  },
};
