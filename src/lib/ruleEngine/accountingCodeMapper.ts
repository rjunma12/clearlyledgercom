/**
 * Accounting Code Mapper
 * Maps transaction categories to standardized accounting codes
 * Compatible with QuickBooks, Xero, MYOB, and general Chart of Accounts
 */

// =============================================================================
// TYPES
// =============================================================================

export interface AccountingCode {
  code: string;           // Standard account code
  name: string;           // Account name
  type: AccountType;      // Account classification
  subType?: string;       // Sub-classification
}

export type AccountType = 
  | 'Income' 
  | 'Expense' 
  | 'Asset' 
  | 'Liability' 
  | 'Equity' 
  | 'Transfer';

export interface AccountingMapping {
  code: string;
  accountName: string;
  accountType: AccountType;
}

// =============================================================================
// STANDARD CHART OF ACCOUNTS
// =============================================================================

/**
 * Standard Chart of Accounts mapping
 * Based on common QuickBooks/Xero account structures
 */
const ACCOUNTING_CODES: Record<string, AccountingCode> = {
  // =========== INCOME (4000 series) ===========
  'Salary': { code: '4000', name: 'Salary Income', type: 'Income' },
  'Wages': { code: '4000', name: 'Salary Income', type: 'Income' },
  'Interest': { code: '4100', name: 'Interest Income', type: 'Income' },
  'Interest Received': { code: '4100', name: 'Interest Income', type: 'Income' },
  'Dividends': { code: '4200', name: 'Dividend Income', type: 'Income' },
  'Refund': { code: '4300', name: 'Refunds & Rebates', type: 'Income' },
  'Cashback': { code: '4300', name: 'Refunds & Rebates', type: 'Income' },
  'Investment': { code: '4400', name: 'Investment Income', type: 'Income' },
  'Rental Income': { code: '4500', name: 'Rental Income', type: 'Income' },
  'Commission': { code: '4600', name: 'Commission Income', type: 'Income' },
  'Other Income': { code: '4900', name: 'Other Income', type: 'Income' },
  
  // =========== EXPENSES (5000-6000 series) ===========
  // Food & Living
  'Groceries': { code: '5100', name: 'Food & Groceries', type: 'Expense' },
  'Dining': { code: '5110', name: 'Dining & Restaurants', type: 'Expense' },
  'Restaurant': { code: '5110', name: 'Dining & Restaurants', type: 'Expense' },
  'Food': { code: '5100', name: 'Food & Groceries', type: 'Expense' },
  
  // Utilities
  'Utilities': { code: '5200', name: 'Utilities', type: 'Expense' },
  'Electricity': { code: '5210', name: 'Electricity', type: 'Expense' },
  'Water': { code: '5220', name: 'Water', type: 'Expense' },
  'Gas': { code: '5230', name: 'Gas', type: 'Expense' },
  'Internet': { code: '5240', name: 'Internet & Phone', type: 'Expense' },
  'Phone': { code: '5240', name: 'Internet & Phone', type: 'Expense' },
  'Mobile': { code: '5240', name: 'Internet & Phone', type: 'Expense' },
  
  // Transportation
  'Transport': { code: '5300', name: 'Transportation', type: 'Expense' },
  'Transportation': { code: '5300', name: 'Transportation', type: 'Expense' },
  'Fuel': { code: '5310', name: 'Fuel & Petrol', type: 'Expense' },
  'Petrol': { code: '5310', name: 'Fuel & Petrol', type: 'Expense' },
  'Parking': { code: '5320', name: 'Parking', type: 'Expense' },
  'Taxi': { code: '5330', name: 'Taxi & Rideshare', type: 'Expense' },
  'Uber': { code: '5330', name: 'Taxi & Rideshare', type: 'Expense' },
  'Public Transport': { code: '5340', name: 'Public Transport', type: 'Expense' },
  'Train': { code: '5340', name: 'Public Transport', type: 'Expense' },
  'Bus': { code: '5340', name: 'Public Transport', type: 'Expense' },
  
  // Entertainment & Lifestyle
  'Entertainment': { code: '5400', name: 'Entertainment', type: 'Expense' },
  'Movies': { code: '5410', name: 'Movies & Cinema', type: 'Expense' },
  'Subscriptions': { code: '5420', name: 'Subscriptions', type: 'Expense' },
  'Netflix': { code: '5420', name: 'Subscriptions', type: 'Expense' },
  'Spotify': { code: '5420', name: 'Subscriptions', type: 'Expense' },
  'Gaming': { code: '5430', name: 'Gaming', type: 'Expense' },
  
  // Shopping
  'Shopping': { code: '5500', name: 'Shopping', type: 'Expense' },
  'Clothing': { code: '5510', name: 'Clothing & Apparel', type: 'Expense' },
  'Electronics': { code: '5520', name: 'Electronics', type: 'Expense' },
  'Home': { code: '5530', name: 'Home & Garden', type: 'Expense' },
  'Furniture': { code: '5530', name: 'Home & Garden', type: 'Expense' },
  
  // Healthcare
  'Healthcare': { code: '5600', name: 'Healthcare', type: 'Expense' },
  'Medical': { code: '5610', name: 'Medical Expenses', type: 'Expense' },
  'Pharmacy': { code: '5620', name: 'Pharmacy', type: 'Expense' },
  'Health Insurance': { code: '5630', name: 'Health Insurance', type: 'Expense' },
  
  // Education
  'Education': { code: '5700', name: 'Education', type: 'Expense' },
  'Tuition': { code: '5710', name: 'Tuition Fees', type: 'Expense' },
  'Books': { code: '5720', name: 'Books & Supplies', type: 'Expense' },
  'Training': { code: '5730', name: 'Training & Courses', type: 'Expense' },
  
  // Financial
  'Bank Fees': { code: '5800', name: 'Bank Fees', type: 'Expense' },
  'Bank Charges': { code: '5800', name: 'Bank Fees', type: 'Expense' },
  'Interest Paid': { code: '5810', name: 'Interest Expense', type: 'Expense' },
  'Loan Repayment': { code: '5820', name: 'Loan Repayments', type: 'Expense' },
  'Insurance': { code: '5830', name: 'Insurance', type: 'Expense' },
  'Tax': { code: '5840', name: 'Taxes', type: 'Expense' },
  
  // Housing
  'Rent': { code: '5900', name: 'Rent', type: 'Expense' },
  'Mortgage': { code: '5910', name: 'Mortgage', type: 'Expense' },
  'Property Tax': { code: '5920', name: 'Property Tax', type: 'Expense' },
  
  // Other
  'Other': { code: '5990', name: 'Other Expenses', type: 'Expense' },
  'Miscellaneous': { code: '5990', name: 'Other Expenses', type: 'Expense' },
  
  // =========== TRANSFERS (6000 series) ===========
  'Transfer': { code: '6000', name: 'Inter-Account Transfer', type: 'Transfer' },
  'Internal Transfer': { code: '6000', name: 'Inter-Account Transfer', type: 'Transfer' },
  'ATM': { code: '6100', name: 'Cash Withdrawal', type: 'Transfer' },
  'Cash Withdrawal': { code: '6100', name: 'Cash Withdrawal', type: 'Transfer' },
  'Cash Deposit': { code: '6200', name: 'Cash Deposit', type: 'Transfer' },
  'Wire Transfer': { code: '6300', name: 'Wire Transfer', type: 'Transfer' },
  
  // =========== ASSETS (1000 series) ===========
  'Savings': { code: '1000', name: 'Savings Account', type: 'Asset' },
  'Fixed Deposit': { code: '1100', name: 'Fixed Deposit', type: 'Asset' },
  
  // =========== LIABILITIES (2000 series) ===========
  'Credit Card': { code: '2000', name: 'Credit Card', type: 'Liability' },
  'Loan': { code: '2100', name: 'Loan Payable', type: 'Liability' },
};

// =============================================================================
// MAPPING FUNCTIONS
// =============================================================================

/**
 * Map a transaction category to its accounting code
 */
export function mapCategoryToAccountingCode(category: string): AccountingMapping | null {
  if (!category) return null;
  
  // Direct match
  const directMatch = ACCOUNTING_CODES[category];
  if (directMatch) {
    return {
      code: directMatch.code,
      accountName: directMatch.name,
      accountType: directMatch.type,
    };
  }
  
  // Case-insensitive match
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(ACCOUNTING_CODES)) {
    if (key.toLowerCase() === lowerCategory) {
      return {
        code: value.code,
        accountName: value.name,
        accountType: value.type,
      };
    }
  }
  
  // Partial match
  for (const [key, value] of Object.entries(ACCOUNTING_CODES)) {
    if (lowerCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategory)) {
      return {
        code: value.code,
        accountName: value.name,
        accountType: value.type,
      };
    }
  }
  
  return null;
}

/**
 * Get all available accounting codes
 */
export function getAvailableAccountingCodes(): AccountingCode[] {
  return Object.values(ACCOUNTING_CODES);
}

/**
 * Get accounting codes by type
 */
export function getAccountingCodesByType(type: AccountType): AccountingCode[] {
  return Object.values(ACCOUNTING_CODES).filter(code => code.type === type);
}

/**
 * Get default code for uncategorized transactions
 */
export function getDefaultAccountingCode(isDebit: boolean): AccountingMapping {
  if (isDebit) {
    return {
      code: '5990',
      accountName: 'Other Expenses',
      accountType: 'Expense',
    };
  }
  return {
    code: '4900',
    accountName: 'Other Income',
    accountType: 'Income',
  };
}

/**
 * Suggest accounting code based on transaction description
 */
export function suggestAccountingCode(description: string, isDebit: boolean): AccountingMapping {
  // First try category mapping
  const categoryMatch = mapCategoryToAccountingCode(description);
  if (categoryMatch) return categoryMatch;
  
  // Check for keywords in description
  const lowerDesc = description.toLowerCase();
  
  // Common keyword mappings
  const keywordMappings: Array<{ keywords: string[]; code: keyof typeof ACCOUNTING_CODES }> = [
    { keywords: ['salary', 'wages', 'payroll'], code: 'Salary' },
    { keywords: ['interest', 'int '], code: isDebit ? 'Interest Paid' : 'Interest' },
    { keywords: ['transfer', 'trf', 'xfer'], code: 'Transfer' },
    { keywords: ['atm', 'cash withdrawal', 'cash wdl'], code: 'ATM' },
    { keywords: ['uber', 'lyft', 'grab', 'ola'], code: 'Taxi' },
    { keywords: ['netflix', 'spotify', 'amazon prime', 'subscription'], code: 'Subscriptions' },
    { keywords: ['grocery', 'supermarket', 'walmart', 'tesco'], code: 'Groceries' },
    { keywords: ['restaurant', 'cafe', 'mcdonald', 'starbucks'], code: 'Dining' },
    { keywords: ['petrol', 'gas station', 'fuel', 'shell', 'bp'], code: 'Fuel' },
    { keywords: ['electricity', 'power', 'electric'], code: 'Electricity' },
    { keywords: ['phone', 'mobile', 'vodafone', 'airtel', 'verizon'], code: 'Phone' },
    { keywords: ['rent', 'rental'], code: 'Rent' },
    { keywords: ['insurance', 'policy premium'], code: 'Insurance' },
    { keywords: ['bank fee', 'bank charge', 'service charge', 'maintenance fee'], code: 'Bank Fees' },
    { keywords: ['loan', 'emi', 'mortgage'], code: isDebit ? 'Loan Repayment' : 'Loan' },
  ];
  
  for (const { keywords, code } of keywordMappings) {
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      const mapping = mapCategoryToAccountingCode(code);
      if (mapping) return mapping;
    }
  }
  
  // Return default
  return getDefaultAccountingCode(isDebit);
}
