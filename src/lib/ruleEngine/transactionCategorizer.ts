/**
 * Transaction Categorization Engine
 * Keyword-based pattern matching for transaction classification
 */

import type { ParsedTransaction } from './types';

// =============================================================================
// TYPES
// =============================================================================

export type TransactionCategory =
  | 'Transfer'
  | 'Salary'
  | 'Utilities'
  | 'Groceries'
  | 'ATM'
  | 'Card Payment'
  | 'Interest'
  | 'Fee'
  | 'Insurance'
  | 'Loan'
  | 'Rent'
  | 'Subscription'
  | 'Entertainment'
  | 'Travel'
  | 'Healthcare'
  | 'Education'
  | 'Government'
  | 'Refund'
  | 'Investment'
  | 'Charity'
  | 'Other';

export interface CategoryMatch {
  category: TransactionCategory;
  confidence: number;
  matchedPattern: string;
}

export interface CategorizedTransaction extends ParsedTransaction {
  category?: TransactionCategory;
  categoryConfidence?: number;
}

// =============================================================================
// CATEGORY PATTERNS
// =============================================================================

/**
 * Pattern definitions for each category
 * Each pattern includes keywords/regexes and a base confidence score
 */
interface CategoryPattern {
  category: TransactionCategory;
  patterns: RegExp[];
  baseConfidence: number;
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  {
    category: 'Salary',
    patterns: [
      /\bsalary\b/i,
      /\bpayroll\b/i,
      /\bwages?\b/i,
      /\bmonthly\s*pay\b/i,
      /\bcompensation\b/i,
      /\bstipend\b/i,
      /\breimbursement\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    category: 'Transfer',
    patterns: [
      /\btransfer\b/i,
      /\btrf\b/i,
      /\bwire\b/i,
      /\bswift\b/i,
      /\brtgs\b/i,
      /\bneft\b/i,
      /\bimps\b/i,
      /\bupi\b/i,
      /\bpayment\s+to\b/i,
      /\bpayment\s+from\b/i,
      /\bfund\s*transfer\b/i,
      /\biban\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'ATM',
    patterns: [
      /\batm\b/i,
      /\bcash\s*withdraw/i,
      /\bcash\s*w\/d\b/i,
      /\bwithdrawal\b/i,
      /\bcashpoint\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    category: 'Card Payment',
    patterns: [
      /\bpos\b/i,
      /\bdebit\s*card\b/i,
      /\bcard\s*purchase\b/i,
      /\bcard\s*payment\b/i,
      /\bvisa\b/i,
      /\bmastercard\b/i,
      /\bcontactless\b/i,
      /\btap\s*to\s*pay\b/i,
      /\bapple\s*pay\b/i,
      /\bgoogle\s*pay\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Utilities',
    patterns: [
      /\belectric/i,
      /\bgas\s+bill\b/i,
      /\bwater\s+bill\b/i,
      /\butility\b/i,
      /\binternet\b/i,
      /\bbroadband\b/i,
      /\bphone\s*bill\b/i,
      /\bmobile\s*bill\b/i,
      /\btelco\b/i,
      /\bairtel\b/i,
      /\bvodafone\b/i,
      /\bjio\b/i,
      /\bt-?mobile\b/i,
      /\bverizon\b/i,
      /\bat&?t\b/i,
      /\bcomcast\b/i,
      /\bspectrum\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Groceries',
    patterns: [
      /\bgrocery\b/i,
      /\bsupermarket\b/i,
      /\bwalmart\b/i,
      /\bcostco\b/i,
      /\bwhole\s*foods\b/i,
      /\btarget\b/i,
      /\bkroger\b/i,
      /\baldi\b/i,
      /\btesco\b/i,
      /\bsainsbury/i,
      /\bwaitrose\b/i,
      /\bmarks\s*(and|&)\s*spencer\b/i,
      /\bm&s\b/i,
      /\basda\b/i,
      /\blidl\b/i,
      /\breliance\s*fresh\b/i,
      /\bbig\s*bazaar\b/i,
      /\bd-?mart\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'Interest',
    patterns: [
      /\binterest\b/i,
      /\bdividend\b/i,
      /\byield\b/i,
      /\bint\.?\s*credit\b/i,
      /\bint\.?\s*earned\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    category: 'Fee',
    patterns: [
      /\bfee\b/i,
      /\bcharge\b/i,
      /\bservice\s*charge\b/i,
      /\bmaintenance\s*charge\b/i,
      /\bbank\s*charge\b/i,
      /\boverdraft\b/i,
      /\bpenalty\b/i,
      /\bsms\s*charge\b/i,
      /\batm\s*fee\b/i,
      /\bforeign\s*transaction\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'Insurance',
    patterns: [
      /\binsurance\b/i,
      /\bpremium\b/i,
      /\bpolicy\s*payment\b/i,
      /\blic\b/i,
      /\bgeico\b/i,
      /\bstate\s*farm\b/i,
      /\ballstate\b/i,
      /\bprogressive\b/i,
      /\baviva\b/i,
      /\baxa\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'Loan',
    patterns: [
      /\bloan\b/i,
      /\bemi\b/i,
      /\bmortgage\b/i,
      /\binstallment\b/i,
      /\brepayment\b/i,
      /\bcar\s*loan\b/i,
      /\bhome\s*loan\b/i,
      /\bpersonal\s*loan\b/i,
      /\bstudent\s*loan\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'Rent',
    patterns: [
      /\brent\b/i,
      /\brental\b/i,
      /\blease\b/i,
      /\blandlord\b/i,
      /\bproperty\s*management\b/i,
      /\bhousing\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Subscription',
    patterns: [
      /\bsubscription\b/i,
      /\bnetflix\b/i,
      /\bspotify\b/i,
      /\bamazon\s*prime\b/i,
      /\bdisney\+?\b/i,
      /\bhbo\b/i,
      /\bhulu\b/i,
      /\byoutube\s*premium\b/i,
      /\bmembership\b/i,
      /\bgym\b/i,
      /\bfitness\b/i,
      /\brecurring\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Entertainment',
    patterns: [
      /\bmovie\b/i,
      /\bcinema\b/i,
      /\btheater\b/i,
      /\btheatre\b/i,
      /\bconcert\b/i,
      /\bgaming\b/i,
      /\bplaystation\b/i,
      /\bxbox\b/i,
      /\bnintendo\b/i,
      /\bsteam\b/i,
      /\brestaurant\b/i,
      /\bdining\b/i,
      /\bfood\s*delivery\b/i,
      /\buber\s*eats\b/i,
      /\bdoordash\b/i,
      /\bgrubhub\b/i,
      /\bzomato\b/i,
      /\bswiggy\b/i,
    ],
    baseConfidence: 0.8,
  },
  {
    category: 'Travel',
    patterns: [
      /\bairline\b/i,
      /\bflight\b/i,
      /\bhotel\b/i,
      /\bairbnb\b/i,
      /\bbooking\.com\b/i,
      /\bexpedia\b/i,
      /\buber\b/i,
      /\blyft\b/i,
      /\bola\b/i,
      /\bgrab\b/i,
      /\btaxi\b/i,
      /\bcab\b/i,
      /\btrain\b/i,
      /\brailway\b/i,
      /\bbus\s*ticket\b/i,
      /\btravel\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Healthcare',
    patterns: [
      /\bhospital\b/i,
      /\bclinic\b/i,
      /\bdoctor\b/i,
      /\bpharmacy\b/i,
      /\bmedical\b/i,
      /\bhealth\b/i,
      /\bdentist\b/i,
      /\boptician\b/i,
      /\bprescription\b/i,
      /\bcvs\b/i,
      /\bwalgreens\b/i,
      /\boots\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Education',
    patterns: [
      /\bschool\b/i,
      /\bcollege\b/i,
      /\buniversity\b/i,
      /\btuition\b/i,
      /\beducation\b/i,
      /\bcourse\b/i,
      /\btraining\b/i,
      /\budemy\b/i,
      /\bcoursera\b/i,
      /\blinkedin\s*learning\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Government',
    patterns: [
      /\btax\b/i,
      /\birs\b/i,
      /\bhmrc\b/i,
      /\bgovernment\b/i,
      /\bgov\.?\s*(uk|us|in)\b/i,
      /\blicense\b/i,
      /\bpermit\b/i,
      /\bcouncil\b/i,
      /\bfines?\b/i,
      /\bvat\b/i,
      /\bgst\b/i,
    ],
    baseConfidence: 0.85,
  },
  {
    category: 'Refund',
    patterns: [
      /\brefund\b/i,
      /\breimbursement\b/i,
      /\breversal\b/i,
      /\bcashback\b/i,
      /\bcash\s*back\b/i,
      /\breturn\b/i,
      /\bcredit\s*note\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'Investment',
    patterns: [
      /\binvestment\b/i,
      /\bmutual\s*fund\b/i,
      /\bstock\b/i,
      /\bshares?\b/i,
      /\bbrokerage\b/i,
      /\brobin\s*hood\b/i,
      /\bvanguard\b/i,
      /\bfidelity\b/i,
      /\bzerodha\b/i,
      /\b401k\b/i,
      /\bpension\b/i,
      /\bsip\b/i,
    ],
    baseConfidence: 0.9,
  },
  {
    category: 'Charity',
    patterns: [
      /\bcharity\b/i,
      /\bdonation\b/i,
      /\bngo\b/i,
      /\bfoundation\b/i,
      /\bfundraiser\b/i,
      /\bred\s*cross\b/i,
      /\bunicef\b/i,
      /\bwwf\b/i,
    ],
    baseConfidence: 0.9,
  },
];

// =============================================================================
// CATEGORIZATION FUNCTIONS
// =============================================================================

/**
 * Categorize a single transaction description
 */
export function categorizeDescription(description: string): CategoryMatch {
  if (!description || description.trim().length === 0) {
    return { category: 'Other', confidence: 0, matchedPattern: '' };
  }
  
  const normalizedDesc = description.toLowerCase().trim();
  
  let bestMatch: CategoryMatch = {
    category: 'Other',
    confidence: 0,
    matchedPattern: '',
  };
  
  for (const categoryPattern of CATEGORY_PATTERNS) {
    for (const pattern of categoryPattern.patterns) {
      const match = normalizedDesc.match(pattern);
      if (match) {
        // Calculate confidence based on match quality
        const matchLength = match[0].length;
        const descLength = normalizedDesc.length;
        const lengthBonus = Math.min(0.1, matchLength / descLength * 0.2);
        
        const confidence = categoryPattern.baseConfidence + lengthBonus;
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category: categoryPattern.category,
            confidence: Math.min(1, confidence),
            matchedPattern: match[0],
          };
        }
      }
    }
  }
  
  return bestMatch;
}

/**
 * Categorize a parsed transaction
 */
export function categorizeTransaction(
  transaction: ParsedTransaction
): CategorizedTransaction {
  const match = categorizeDescription(transaction.description);
  
  return {
    ...transaction,
    category: match.category,
    categoryConfidence: match.confidence,
  };
}

/**
 * Categorize all transactions in a list
 */
export function categorizeAllTransactions(
  transactions: ParsedTransaction[]
): CategorizedTransaction[] {
  return transactions.map(categorizeTransaction);
}

/**
 * Get category statistics for a list of transactions
 */
export function getCategoryStatistics(
  transactions: CategorizedTransaction[]
): Map<TransactionCategory, { count: number; totalDebit: number; totalCredit: number }> {
  const stats = new Map<TransactionCategory, { count: number; totalDebit: number; totalCredit: number }>();
  
  for (const tx of transactions) {
    const category = tx.category ?? 'Other';
    const existing = stats.get(category) ?? { count: 0, totalDebit: 0, totalCredit: 0 };
    
    stats.set(category, {
      count: existing.count + 1,
      totalDebit: existing.totalDebit + (tx.debit ?? 0),
      totalCredit: existing.totalCredit + (tx.credit ?? 0),
    });
  }
  
  return stats;
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): TransactionCategory[] {
  return [
    'Transfer',
    'Salary',
    'Utilities',
    'Groceries',
    'ATM',
    'Card Payment',
    'Interest',
    'Fee',
    'Insurance',
    'Loan',
    'Rent',
    'Subscription',
    'Entertainment',
    'Travel',
    'Healthcare',
    'Education',
    'Government',
    'Refund',
    'Investment',
    'Charity',
    'Other',
  ];
}
