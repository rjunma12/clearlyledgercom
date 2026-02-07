/**
 * Regional & Language Auto-Aliasing Configuration
 * Maps international headers to uniform schema
 */

import type { LocaleConfig, HeaderAlias, Locale } from './types';

// =============================================================================
// HEADER DICTIONARY - International Header Mappings
// =============================================================================

export const HEADER_ALIASES: HeaderAlias[] = [
  {
    canonical: 'date',
    aliases: [
      // English
      'Date', 'DATE', 'Txn Date', 'TXN DATE', 'Transaction Date', 'Trans Date',
      'Value Date', 'Posting Date', 'Entry Date', 'Effective Date', 'Book Date',
      'Post Date', 'Trade Date', 'Tran Date', 'Txn Dt', 'Trans Dt', 'Dt',
      // Spanish
      'Fecha', 'FECHA', 'Fecha de Transacción', 'Fecha Valor', 'Fecha Operación',
      // French
      'Date', 'Date d\'opération', 'Date de valeur',
      // German
      'Datum', 'Buchungsdatum', 'Valutadatum', 'Wertstellung', 'Buchungstag',
      // Arabic
      'التاريخ', 'تاريخ المعاملة', 'تاريخ القيمة', 'تاريخ العملية',
      // Hindi
      'तारीख', 'दिनांक',
      // Chinese
      '日期', '交易日期',
      // Portuguese
      'Data', 'Data da Transação',
      // Italian
      'Data', 'Data Operazione', 'Data Valuta',
      // Dutch
      'Datum', 'Boekdatum', 'Boekingsdatum',
      // Japanese
      '取引日',
      // Malay
      'Tarikh', 'Tarikh Urus Niaga',
    ],
  },
  {
    canonical: 'description',
    aliases: [
      // English
      'Description', 'DESCRIPTION', 'Particulars', 'PARTICULARS', 'Narration',
      'NARRATION', 'Details', 'Transaction Details', 'Trans. Description',
      'Memo', 'Reference', 'Remarks', 'Transaction', 'Payment Details',
      'Trans Type', 'Tran Type', 'Txn Type', 'Payment Type', 'Trans Ref',
      'Ref No', 'Ref Number',
      // Spanish
      'Descripción', 'DESCRIPCIÓN', 'Concepto', 'Detalle', 'Movimiento',
      // French
      'Description', 'Libellé', 'Opération', 'Détail', 'Numéro de Référence',
      // German
      'Beschreibung', 'Verwendungszweck', 'Buchungstext', 'Empfänger/Auftraggeber', 'Referenznummer',
      // Arabic
      'البيان', 'الوصف', 'التفاصيل', 'الملاحظات',
      // Hindi
      'विवरण', 'ब्योरा',
      // Chinese
      '描述', '摘要', '交易说明',
      // Portuguese
      'Descrição', 'Histórico', 'Lançamento',
      // Italian
      'Descrizione', 'Causale',
      // Dutch
      'Omschrijving', 'Beschrijving',
    ],
  },
  {
    canonical: 'debit',
    aliases: [
      // English (Standard)
      'Debit', 'DEBIT', 'Debits', 'Debit Amount', 'Debit Amt', 'Debit Amt.',
      'Dr', 'DR', 'Dr.', 'D',
      // English (Withdrawal variants) - HDFC, SBI, ICICI, etc.
      'Withdrawal', 'Withdrawals', 'Withdrawal Amt', 'Withdrawal Amt.',
      'Withdrawal Amount', 'Withdrawl', 'With Drawal',
      // English (Outflow variants)
      'Out', 'Money Out', 'Paid Out', 'Outflow', 'Outgoing',
      'Payments', 'Payment', 'Cash Out', 'Payout',
      // English (Charge/Expense variants)
      'Charges', 'Charge', 'Expense', 'Expenses', 'Deductions',
      // Spanish
      'Débito', 'DÉBITO', 'Debito', 'Cargo', 'Cargos', 'Retiro', 'Retiros', 'Salida',
      // French
      'Débit', 'Débiteur', 'Sortie', 'Sorties', 'Retrait',
      // German
      'Soll', 'Lastschrift', 'Auszahlung', 'Ausgabe', 'Ausgaben', 'Belastung',
      // Portuguese
      'Saída', 'Saida', 'Débitos',
      // Italian
      'Addebito', 'Dare', 'Uscita', 'Uscite',
      // Dutch
      'Debet', 'Af', 'Afschrijving', 'Uitgaven',
      // Hindi
      'डेबिट', 'निकासी', 'आहरण',
      // Chinese
      '借方', '支出', '取款', '提款',
      // Japanese
      '出金', '引落', '支払',
      // Malay/Indonesian
      'Keluar', 'Pengeluaran',
      // Arabic
      'مدين', 'سحب', 'المسحوبات', 'مصروفات',
      // Thai
      'ถอน', 'รายจ่าย',
      // Korean
      '출금', '인출',
      // Turkish
      'Borç', 'Çıkış', 'Ödeme',
    ],
  },
  {
    canonical: 'credit',
    aliases: [
      // English (Standard)
      'Credit', 'CREDIT', 'Credits', 'Credit Amount', 'Credit Amt', 'Credit Amt.',
      'Cr', 'CR', 'Cr.', 'C',
      // English (Deposit variants)
      'Deposit', 'Deposits', 'Deposit Amt', 'Deposit Amt.',
      'Deposit Amount', 'Lodgement', 'Lodgments',
      // English (Inflow variants)
      'In', 'Money In', 'Paid In', 'Inflow', 'Incoming', 'Receipt',
      'Receipts', 'Received', 'Cash In', 'Income',
      // Spanish
      'Crédito', 'CRÉDITO', 'Credito', 'Abono', 'Abonos', 'Depósito', 'Deposito',
      'Depósitos', 'Entrada', 'Ingreso', 'Ingresos',
      // French
      'Crédit', 'Créditeur', 'Entrée', 'Entrees', 'Versement',
      // German
      'Haben', 'Gutschrift', 'Einzahlung', 'Eingang', 'Eingänge', 'Zugang',
      // Portuguese
      'Créditos',
      // Italian
      'Accredito', 'Avere', 'Entrata', 'Entrate',
      // Dutch
      'Bij', 'Bijschrijving', 'Inkomsten',
      // Hindi
      'क्रेडिट', 'जमा', 'जमाराशि',
      // Chinese
      '贷方', '收入', '存款', '入账',
      // Japanese
      '入金', '預入', '受取',
      // Malay/Indonesian
      'Masuk', 'Pemasukan', 'Kredit',
      // Arabic
      'دائن', 'إيداع', 'الإيداعات', 'دخل',
      // Thai
      'ฝาก', 'รายรับ',
      // Korean
      '입금', '예금',
      // Turkish
      'Alacak', 'Giriş', 'Yatırım',
    ],
  },
  {
    canonical: 'balance',
    aliases: [
      // English
      'Balance', 'BALANCE', 'Running Balance', 'Available Balance', 'Closing Balance',
      'Current Balance', 'Ledger Balance', 'Book Balance', 'Total', 'Net Balance',
      // Spanish
      'Saldo', 'SALDO', 'Saldo Actual', 'Saldo Disponible',
      // French
      'Solde', 'Solde Courant', 'Solde Disponible',
      // German
      'Saldo', 'Kontostand', 'Guthaben',
      // Arabic
      'الرصيد', 'الرصيد المتاح', 'الرصيد الحالي',
      // Hindi
      'शेष', 'बैलेंस',
      // Chinese
      '余额', '结余', '账户余额',
      // Portuguese
      'Saldo', 'Saldo Atual',
      // Italian
      'Saldo', 'Saldo Disponibile',
      // Dutch
      'Saldo', 'Balans',
    ],
  },
];

// =============================================================================
// OPENING BALANCE DETECTION KEYWORDS
// =============================================================================

export const OPENING_BALANCE_KEYWORDS = [
  // English
  'Opening Balance', 'OPENING BALANCE', 'Opening Bal', 'Open Bal',
  'Balance Brought Forward', 'Balance B/F', 'B/F', 'Brought Forward',
  'Previous Balance', 'Starting Balance', 'Initial Balance',
  // Spanish
  'Saldo Inicial', 'Saldo Anterior',
  // French
  'Solde d\'ouverture', 'Ancien Solde', 'Report',
  // German
  'Anfangssaldo', 'Saldovortrag', 'Vorheriger Saldo',
  // Arabic
  'الرصيد الافتتاحي', 'رصيد مرحل',
];

export const CLOSING_BALANCE_KEYWORDS = [
  // English
  'Closing Balance', 'CLOSING BALANCE', 'Closing Bal', 'Close Bal',
  'Balance Carried Forward', 'Balance C/F', 'C/F', 'Carried Forward',
  'Ending Balance', 'Final Balance',
  // Spanish
  'Saldo Final', 'Saldo de Cierre',
  // French
  'Solde de clôture', 'Nouveau Solde',
  // German
  'Endsaldo', 'Schlusssaldo',
  // Arabic
  'الرصيد الختامي', 'رصيد نهائي',
];

// =============================================================================
// LOCALE CONFIGURATIONS
// =============================================================================

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  'en-US': {
    locale: 'en-US',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '$',
      currencyPosition: 'prefix',
    },
    dateFormats: ['MM/DD/YYYY', 'M/D/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'en-GB': {
    locale: 'en-GB',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '£',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'en-IN': {
    locale: 'en-IN',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '₹',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'D/M/YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'en-AE': {
    locale: 'en-AE',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: 'AED',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'es-ES': {
    locale: 'es-ES',
    numberFormat: {
      thousandsSeparator: '.',
      decimalSeparator: ',',
      currencySymbol: '€',
      currencyPosition: 'suffix',
    },
    dateFormats: ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'es-MX': {
    locale: 'es-MX',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '$',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'fr-FR': {
    locale: 'fr-FR',
    numberFormat: {
      thousandsSeparator: ' ',
      decimalSeparator: ',',
      currencySymbol: '€',
      currencyPosition: 'suffix',
    },
    dateFormats: ['DD/MM/YYYY', 'DD.MM.YYYY', 'YYYY-MM-DD'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'de-DE': {
    locale: 'de-DE',
    numberFormat: {
      thousandsSeparator: '.',
      decimalSeparator: ',',
      currencySymbol: '€',
      currencyPosition: 'suffix',
    },
    dateFormats: ['DD.MM.YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'ar-AE': {
    locale: 'ar-AE',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: 'د.إ',
      currencyPosition: 'suffix',
    },
    dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD'],
    headerAliases: HEADER_ALIASES,
    rtl: true,
  },
  'ar-SA': {
    locale: 'ar-SA',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: 'ر.س',
      currencyPosition: 'suffix',
    },
    dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD'],
    headerAliases: HEADER_ALIASES,
    rtl: true,
  },
  'hi-IN': {
    locale: 'hi-IN',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '₹',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'zh-CN': {
    locale: 'zh-CN',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '¥',
      currencyPosition: 'prefix',
    },
    dateFormats: ['YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY年MM月DD日'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'ja-JP': {
    locale: 'ja-JP',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '¥',
      currencyPosition: 'prefix',
    },
    dateFormats: ['YYYY/MM/DD', 'YYYY-MM-DD', 'YYYY年MM月DD日'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'ms-MY': {
    locale: 'ms-MY',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: 'RM',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'en-AU': {
    locale: 'en-AU',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '$',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY', 'DD MMM YY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'en-NZ': {
    locale: 'en-NZ',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '$',
      currencyPosition: 'prefix',
    },
    dateFormats: ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
  'auto': {
    locale: 'auto',
    numberFormat: {
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '',
      currencyPosition: 'prefix',
    },
    dateFormats: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'],
    headerAliases: HEADER_ALIASES,
    rtl: false,
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Find the canonical column type for a given header text
 */
export function findCanonicalHeader(headerText: string): string | null {
  const normalizedText = headerText.trim().toLowerCase();
  
  for (const alias of HEADER_ALIASES) {
    for (const aliasText of alias.aliases) {
      if (aliasText.toLowerCase() === normalizedText) {
        return alias.canonical;
      }
    }
  }
  
  return null;
}

/**
 * Check if text indicates an opening balance row
 */
export function isOpeningBalanceRow(text: string): boolean {
  const normalizedText = text.toLowerCase();
  return OPENING_BALANCE_KEYWORDS.some(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if text indicates a closing balance row
 */
export function isClosingBalanceRow(text: string): boolean {
  const normalizedText = text.toLowerCase();
  return CLOSING_BALANCE_KEYWORDS.some(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  );
}

/**
 * Detect locale from document content
 */
export function detectLocale(headers: string[], sampleNumbers: string[]): Locale {
  // Check for RTL characters (Arabic)
  const hasArabic = headers.some(h => /[\u0600-\u06FF]/.test(h));
  if (hasArabic) return 'ar-AE';
  
  // Check for Chinese characters
  const hasChinese = headers.some(h => /[\u4E00-\u9FFF]/.test(h));
  if (hasChinese) return 'zh-CN';
  
  // Check for Japanese characters
  const hasJapanese = headers.some(h => /[\u3040-\u309F\u30A0-\u30FF]/.test(h));
  if (hasJapanese) return 'ja-JP';
  
  // Check number format to distinguish European vs US
  const euroFormat = sampleNumbers.some(n => /\d+\.\d{3},\d{2}$/.test(n));
  if (euroFormat) return 'de-DE';
  
  // Default to en-US
  return 'en-US';
}

// =============================================================================
// TESSERACT LANGUAGE MAPPING
// =============================================================================

/**
 * Map locales to Tesseract.js language codes
 */
export const TESSERACT_LANGUAGE_MAP: Partial<Record<Locale, string[]>> = {
  'en-US': ['eng'],
  'en-GB': ['eng'],
  'en-IN': ['eng'],
  'en-AE': ['eng'],
  'en-AU': ['eng'],
  'en-NZ': ['eng'],
  'es-ES': ['spa'],
  'es-MX': ['spa'],
  'fr-FR': ['fra'],
  'de-DE': ['deu'],
  'ar-AE': ['ara', 'eng'],
  'ar-SA': ['ara', 'eng'],
  'hi-IN': ['hin', 'eng'],
  'zh-CN': ['chi_sim'],
  'ja-JP': ['jpn'],
  'ms-MY': ['msa', 'eng'],
  'auto': ['eng'],
};

/**
 * Get Tesseract language codes for a locale
 */
export function getTesseractLanguages(locale: Locale): string[] {
  return TESSERACT_LANGUAGE_MAP[locale] || ['eng'];
}
