/**
 * Header Detection & Column Anchor Locking
 * Detects header row and locks column X-anchors from headers
 * Reuses anchors across all pages for consistency
 */

import type { PdfLine, PdfWord, ColumnBoundary, ColumnType } from './tableDetector';

// =============================================================================
// TYPES
// =============================================================================

export interface LockedColumnAnchors {
  date: ColumnAnchor | null;
  description: ColumnAnchor | null;
  debit: ColumnAnchor | null;
  credit: ColumnAnchor | null;
  balance: ColumnAnchor | null;
}

export interface ColumnAnchor {
  x0: number;
  x1: number;
  centerX: number;
  headerText: string;
  confidence: number;
}

export interface HeaderDetectionResult {
  headerLine: PdfLine | null;
  headerLineIndex: number;
  anchors: LockedColumnAnchors;
  confidence: number;
}

// =============================================================================
// HEADER KEYWORD MAPS
// =============================================================================

const HEADER_KEYWORDS: Record<ColumnType, string[]> = {
  date: [
    // English
    'date', 'txn date', 'transaction date', 'value date', 'post date',
    'posting date', 'trans date', 'dated', 'dt', 'tran date', 'txn dt', 'trans dt',
    'trade date', 'entry date', 'effective date', 'book date',
    // German
    'datum', 'buchungstag', 'buchungsdatum', 'valutadatum', 'wertstellung',
    // Spanish
    'fecha', 'fecha operación', 'fecha de transacción', 'fecha valor',
    // French
    'date d\'opération', 'date de valeur',
    // Italian
    'data', 'data operazione', 'data valuta',
    // Dutch
    'boekingsdatum',
    // Arabic
    'التاريخ', 'تاريخ العملية',
    // Hindi
    'तारीख', 'दिनांक',
    // Chinese
    '日期', '交易日期', '取引日',
    // Malay
    'tarikh', 'tarikh urus niaga',
    // Japanese
    '取引日',
  ],
  description: [
    // English
    'description', 'particulars', 'narration', 'details', 'remarks',
    'transaction details', 'memo', 'reference', 'trans type', 'tran type',
    'txn type', 'payment type', 'trans ref', 'ref no', 'ref number',
    'payment details', 'transaction',
    // German
    'beschreibung', 'verwendungszweck', 'buchungstext', 'referenznummer',
    // French
    'libellé', 'opération', 'détail', 'numéro de référence',
    // Spanish
    'descripción', 'concepto', 'detalle', 'movimiento',
    // Italian
    'descrizione', 'causale',
    // Dutch
    'omschrijving', 'beschrijving',
    // Arabic
    'البيان', 'الوصف', 'التفاصيل', 'الملاحظات',
    // Hindi
    'विवरण', 'ब्योरा',
    // Chinese
    '描述', '摘要', '交易说明',
    // Malay
    'keterangan',
  ],
  debit: [
    // English (Standard)
    'debit', 'debits', 'debit amount', 'debit amt', 'debit amt.',
    'dr', 'dr.', 'd',
    // English (Withdrawal variants) - HDFC, SBI, ICICI, etc.
    'withdrawal', 'withdrawals', 'withdrawal amt', 'withdrawal amt.',
    'withdrawal amount', 'withdrawl', 'with drawal',
    // English (Outflow variants)
    'out', 'money out', 'paid out', 'outflow', 'outgoing',
    'payments', 'payment', 'cash out', 'payout',
    // English (Charge/Expense variants)
    'charges', 'charge', 'expense', 'expenses', 'deductions',
    // Spanish
    'débito', 'debito', 'cargo', 'cargos', 'retiro', 'retiros', 'salida',
    // French
    'débit', 'débiteur', 'sortie', 'sorties', 'retrait',
    // German
    'soll', 'lastschrift', 'auszahlung', 'ausgabe', 'ausgaben', 'belastung',
    // Portuguese
    'saída', 'saida', 'débitos',
    // Italian
    'addebito', 'dare', 'uscita', 'uscite',
    // Dutch
    'debet', 'af', 'afschrijving', 'uitgaven',
    // Hindi
    'डेबिट', 'निकासी', 'आहरण',
    // Chinese
    '借方', '支出', '取款', '提款',
    // Japanese
    '出金', '引落', '支払',
    // Malay/Indonesian
    'keluar', 'pengeluaran',
    // Arabic
    'مدين', 'سحب', 'المسحوبات', 'مصروفات',
    // Thai
    'ถอน', 'รายจ่าย',
    // Korean
    '출금', '인출',
    // Turkish
    'borç', 'çıkış', 'ödeme',
    // Additional regional (Cheque/Check variants)
    'cheque amt', 'cheque amt.', 'check amt', 'check amt.',
    'débits', 'prélèvement', 'dépense', 'pagamento', 'betalning', 'uttag', 'çekim',
    'expenditure', 'spent', 'amount out', 'dr amount', 'debit tran', 'withdrawal tran',
    // Swedish
    'uttag', 'betalning',
  ],
  credit: [
    // English (Standard)
    'credit', 'credits', 'credit amount', 'credit amt', 'credit amt.',
    'cr', 'cr.', 'c',
    // English (Deposit variants)
    'deposit', 'deposits', 'deposit amt', 'deposit amt.',
    'deposit amount', 'lodgement', 'lodgments',
    // English (Inflow variants)
    'in', 'money in', 'paid in', 'inflow', 'incoming', 'receipt',
    'receipts', 'received', 'cash in', 'income',
    // Spanish
    'crédito', 'credito', 'abono', 'abonos', 'depósito', 'deposito',
    'depósitos', 'entrada', 'ingreso', 'ingresos',
    // French
    'crédit', 'créditeur', 'entrée', 'entrees', 'versement',
    // German
    'haben', 'gutschrift', 'einzahlung', 'eingang', 'eingänge', 'zugang',
    // Portuguese
    'créditos',
    // Italian
    'accredito', 'avere', 'entrata', 'entrate',
    // Dutch
    'bij', 'bijschrijving', 'inkomsten',
    // Hindi
    'क्रेडिट', 'जमा', 'जमाराशि',
    // Chinese
    '贷方', '收入', '存款', '入账',
    // Japanese
    '入金', '預入', '受取',
    // Malay/Indonesian
    'masuk', 'pemasukan', 'kredit',
    // Arabic
    'دائن', 'إيداع', 'الإيداعات', 'دخل',
    // Thai
    'ฝาก', 'รายรับ',
    // Korean
    '입금', '예금',
    // Turkish
    'alacak', 'giriş', 'yatırım',
    // Additional regional
    'cr amount', 'credit tran', 'deposits amt', 'lodgement amt', 'lodgment amt',
    'amount in', 'guthaben', 'einnahme', 'encaissement', 'recette', 'incasso',
    'insättning', 'yatırılan', 'proceeds', 'funds in',
    // Swedish
    'insättning',
  ],
  balance: [
    // English
    'balance', 'running balance', 'available balance', 'closing',
    'closing balance', 'bal', 'stmt balance', 'account balance', 'end balance',
    'statement balance', 'new balance', 'updated balance', 'ledger balance',
    'current balance', 'net balance', 'book balance', 'total',
    // German
    'saldo', 'kontostand', 'guthaben', 'endsaldo',
    // French
    'solde', 'solde courant', 'solde disponible', 'solde final',
    // Spanish
    'saldo actual', 'saldo disponible',
    // Italian
    'saldo disponibile',
    // Dutch
    'balans',
    // Russian
    'остаток',
    // Czech
    'konečný zůstatek',
    // Arabic
    'الرصيد', 'الرصيد المتاح', 'الرصيد الحالي',
    // Hindi
    'शेष', 'बैलेंस',
    // Chinese
    '余额', '结余', '账户余额',
    // Thai
    'ยอดคงเหลือ',
    // Malay
    'baki'
  ],
  reference: ['ref', 'reference', 'ref no', 'txn id', 'transaction id'],
  amount: ['amount', 'value', 'transaction amount', 'txn amt'],
  value_date: ['value date', 'val date', 'effective date'],
  unknown: [],
};

// =============================================================================
// MULTI-LINE HEADER DETECTION
// =============================================================================

/**
 * Merge adjacent header lines that are within Y-tolerance
 * Handles headers like "Transaction\nDate" split across lines
 */
function mergeAdjacentHeaderLines(lines: PdfLine[]): PdfLine[] {
  if (lines.length === 0) return [];
  
  const searchLimit = Math.min(15, lines.length);
  const mergedLines: PdfLine[] = [];
  let currentMerge: PdfWord[] = [];
  let currentBottom = -100;
  let currentPage = -1;
  
  for (let i = 0; i < searchLimit; i++) {
    const line = lines[i];
    
    // Check if line contains any header keywords
    const lineText = line.words.map(w => w.text.toLowerCase()).join(' ');
    const hasHeaderWord = Object.values(HEADER_KEYWORDS).flat().some(kw => 
      lineText.includes(kw.toLowerCase())
    );
    
    if (!hasHeaderWord) {
      // Finalize current merge if exists
      if (currentMerge.length > 0) {
        mergedLines.push(createMergedLine(currentMerge));
        currentMerge = [];
      }
      continue;
    }
    
    // Check if line is within 10px of previous header line (same page)
    const yGap = line.top - currentBottom;
    const samePage = line.pageNumber === currentPage;
    
    if (samePage && yGap >= 0 && yGap < 10 && currentMerge.length > 0) {
      // Merge with current
      currentMerge.push(...line.words);
    } else {
      // Finalize previous merge and start new
      if (currentMerge.length > 0) {
        mergedLines.push(createMergedLine(currentMerge));
      }
      currentMerge = [...line.words];
    }
    
    currentBottom = line.bottom;
    currentPage = line.pageNumber;
  }
  
  // Finalize last merge
  if (currentMerge.length > 0) {
    mergedLines.push(createMergedLine(currentMerge));
  }
  
  return mergedLines;
}

function createMergedLine(words: PdfWord[]): PdfLine {
  words.sort((a, b) => a.x0 - b.x0);
  return {
    words,
    top: Math.min(...words.map(w => w.top)),
    bottom: Math.max(...words.map(w => w.bottom)),
    left: Math.min(...words.map(w => w.x0)),
    right: Math.max(...words.map(w => w.x1)),
    pageNumber: words[0].pageNumber,
  };
}

// =============================================================================
// HEADER DETECTION
// =============================================================================

/**
 * Detect header row by finding line with most column keyword matches
 * Now includes multi-line header merging for split headers
 */
export function detectAndLockHeaders(lines: PdfLine[]): HeaderDetectionResult {
  // First, try to merge adjacent header lines
  const mergedHeaderLines = mergeAdjacentHeaderLines(lines);
  
  // Search both original and merged lines
  const searchLines = [...mergedHeaderLines, ...lines.slice(0, 15)];
  
  let bestHeaderLine: PdfLine | null = null;
  let bestHeaderIndex = -1;
  let bestMatchCount = 0;
  let bestAnchors: LockedColumnAnchors = createEmptyAnchors();
  
  for (let i = 0; i < searchLines.length; i++) {
    const line = searchLines[i];
    const lineText = line.words.map(w => w.text.toLowerCase()).join(' ');
    
    // Count how many column types are matched
    let matchCount = 0;
    const matches: Array<{ type: ColumnType; word: PdfWord; keyword: string }> = [];
    
    for (const [colType, keywords] of Object.entries(HEADER_KEYWORDS)) {
      if (colType === 'unknown') continue;
      
      for (const keyword of keywords) {
        if (lineText.includes(keyword.toLowerCase())) {
          // Find the word that contains this keyword
          const matchingWord = line.words.find(w => 
            w.text.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (matchingWord) {
            matches.push({
              type: colType as ColumnType,
              word: matchingWord,
              keyword,
            });
            matchCount++;
            break; // Only count each column type once
          }
        }
      }
    }
    
    // Need at least 3 column matches to be a valid header
    if (matchCount >= 3 && matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestHeaderLine = line;
      bestHeaderIndex = i;
      bestAnchors = buildAnchorsFromMatches(matches);
    }
  }
  
  const confidence = bestMatchCount >= 4 ? 0.9 : bestMatchCount >= 3 ? 0.7 : 0.3;
  
  console.log(`[HeaderAnchors] Header detected at line ${bestHeaderIndex}, matches: ${bestMatchCount}, confidence: ${confidence}`);
  
  return {
    headerLine: bestHeaderLine,
    headerLineIndex: bestHeaderIndex,
    anchors: bestAnchors,
    confidence,
  };
}

/**
 * Build locked anchors from matched keywords
 */
function buildAnchorsFromMatches(
  matches: Array<{ type: ColumnType; word: PdfWord; keyword: string }>
): LockedColumnAnchors {
  const anchors = createEmptyAnchors();
  
  for (const match of matches) {
    const anchor: ColumnAnchor = {
      x0: match.word.x0,
      x1: match.word.x1,
      centerX: (match.word.x0 + match.word.x1) / 2,
      headerText: match.word.text,
      confidence: 0.9,
    };
    
    switch (match.type) {
      case 'date':
        anchors.date = anchor;
        break;
      case 'description':
        anchors.description = anchor;
        break;
      case 'debit':
        anchors.debit = anchor;
        break;
      case 'credit':
        anchors.credit = anchor;
        break;
      case 'balance':
        anchors.balance = anchor;
        break;
    }
  }
  
  return anchors;
}

/**
 * Create empty anchors structure
 */
function createEmptyAnchors(): LockedColumnAnchors {
  return {
    date: null,
    description: null,
    debit: null,
    credit: null,
    balance: null,
  };
}

// =============================================================================
// ANCHOR USAGE WITH ADAPTIVE DRIFT TOLERANCE
// =============================================================================

// Default page drift tolerance in pixels
const DEFAULT_PAGE_DRIFT_TOLERANCE = 15;
const MAX_PAGE_DRIFT_TOLERANCE = 30;

/**
 * Calculate adaptive drift tolerance based on observed column drift between pages
 * Returns a tolerance value between DEFAULT and MAX based on actual page variation
 */
export function calculateAdaptiveDriftTolerance(
  page1Boundaries: ColumnBoundary[],
  pageNBoundaries: ColumnBoundary[]
): number {
  if (page1Boundaries.length === 0 || pageNBoundaries.length === 0) {
    return DEFAULT_PAGE_DRIFT_TOLERANCE;
  }
  
  const drifts: number[] = [];
  
  // Compare column positions between pages
  for (let i = 0; i < Math.min(page1Boundaries.length, pageNBoundaries.length); i++) {
    const drift = Math.abs(page1Boundaries[i].centerX - pageNBoundaries[i].centerX);
    drifts.push(drift);
  }
  
  if (drifts.length === 0) return DEFAULT_PAGE_DRIFT_TOLERANCE;
  
  const avgDrift = drifts.reduce((a, b) => a + b, 0) / drifts.length;
  
  // Use 2x average drift as tolerance, clamped between DEFAULT and MAX
  const adaptiveTolerance = Math.min(MAX_PAGE_DRIFT_TOLERANCE, Math.max(DEFAULT_PAGE_DRIFT_TOLERANCE, avgDrift * 2));
  
  console.log(`[HeaderAnchors] Adaptive drift tolerance: ${adaptiveTolerance.toFixed(1)}px (avg drift: ${avgDrift.toFixed(1)}px)`);
  
  return adaptiveTolerance;
}

/**
 * Assign a word to a column based on locked anchors
 * Uses X-position overlap with anchors
 * @param pageNumber - Page number for tolerance-based matching (page 1 = strict, page 2+ = allow drift)
 */
export function assignWordToColumn(
  word: PdfWord,
  anchors: LockedColumnAnchors,
  pageNumber: number = 1
): ColumnType | null {
  const wordCenter = (word.x0 + word.x1) / 2;
  
  // Page 1: strict matching. Page 2+: allow tolerance for column drift
  const tolerance = pageNumber === 1 ? 0 : DEFAULT_PAGE_DRIFT_TOLERANCE;
  
  // Check each anchor
  const anchorEntries: Array<[string, ColumnAnchor | null]> = [
    ['date', anchors.date],
    ['description', anchors.description],
    ['debit', anchors.debit],
    ['credit', anchors.credit],
    ['balance', anchors.balance],
  ];
  
  for (const [colType, anchor] of anchorEntries) {
    if (!anchor) continue;
    
    // Apply tolerance to anchor bounds
    const anchorLeft = anchor.x0 - tolerance;
    const anchorRight = anchor.x1 + tolerance;
    
    // Check if word overlaps with anchor (with tolerance)
    const overlap = calculateOverlap(word.x0, word.x1, anchorLeft, anchorRight);
    
    if (overlap > 0.3) { // >30% overlap
      return colType as ColumnType;
    }
    
    // Or if word center is within anchor bounds (with tolerance)
    if (wordCenter >= anchorLeft && wordCenter <= anchorRight) {
      return colType as ColumnType;
    }
  }
  
  return null;
}

/**
 * Calculate overlap ratio between two ranges
 */
function calculateOverlap(
  a0: number, a1: number,
  b0: number, b1: number
): number {
  const overlapStart = Math.max(a0, b0);
  const overlapEnd = Math.min(a1, b1);
  
  if (overlapStart >= overlapEnd) return 0;
  
  const overlapWidth = overlapEnd - overlapStart;
  const aWidth = a1 - a0;
  
  return aWidth > 0 ? overlapWidth / aWidth : 0;
}

/**
 * Convert locked anchors to ColumnBoundary array for compatibility
 */
export function anchorsToColumnBoundaries(anchors: LockedColumnAnchors): ColumnBoundary[] {
  const boundaries: ColumnBoundary[] = [];
  
  const anchorEntries: Array<[ColumnType, ColumnAnchor | null]> = [
    ['date', anchors.date],
    ['description', anchors.description],
    ['debit', anchors.debit],
    ['credit', anchors.credit],
    ['balance', anchors.balance],
  ];
  
  for (const [colType, anchor] of anchorEntries) {
    if (anchor) {
      boundaries.push({
        x0: anchor.x0,
        x1: anchor.x1,
        centerX: anchor.centerX,
        inferredType: colType,
        confidence: anchor.confidence,
      });
    }
  }
  
  // Sort by X position
  boundaries.sort((a, b) => a.x0 - b.x0);
  
  return boundaries;
}
