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
      // Spanish
      'Fecha', 'FECHA', 'Fecha de Transacción', 'Fecha Valor',
      // French
      'Date', 'Date d\'opération', 'Date de valeur',
      // German
      'Datum', 'Buchungsdatum', 'Valutadatum', 'Wertstellung',
      // Arabic
      'التاريخ', 'تاريخ المعاملة', 'تاريخ القيمة',
      // Hindi
      'तारीख', 'दिनांक',
      // Chinese
      '日期', '交易日期',
      // Portuguese
      'Data', 'Data da Transação',
      // Italian
      'Data', 'Data Operazione',
      // Dutch
      'Datum', 'Boekdatum',
    ],
  },
  {
    canonical: 'description',
    aliases: [
      // English
      'Description', 'DESCRIPTION', 'Particulars', 'PARTICULARS', 'Narration',
      'NARRATION', 'Details', 'Transaction Details', 'Trans. Description',
      'Memo', 'Reference', 'Remarks', 'Transaction', 'Payment Details',
      // Spanish
      'Descripción', 'DESCRIPCIÓN', 'Concepto', 'Detalle', 'Movimiento',
      // French
      'Description', 'Libellé', 'Opération', 'Détail',
      // German
      'Beschreibung', 'Verwendungszweck', 'Buchungstext', 'Empfänger/Auftraggeber',
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
      // English
      'Debit', 'DEBIT', 'Debits', 'Debit Amount', 'Withdrawal', 'Withdrawals',
      'Dr', 'DR', 'Dr.', 'Money Out', 'Payments', 'Paid Out', 'Outflow',
      // Spanish
      'Débito', 'DÉBITO', 'Cargo', 'Cargos', 'Retiro', 'Retiros',
      // French
      'Débit', 'Débiteur', 'Sortie',
      // German
      'Soll', 'Lastschrift', 'Auszahlung', 'Ausgabe',
      // Arabic
      'مدين', 'سحب', 'المسحوبات',
      // Hindi
      'डेबिट', 'निकासी',
      // Chinese
      '借方', '支出', '取款',
      // Portuguese
      'Débito', 'Saída',
      // Italian
      'Addebito', 'Dare',
      // Dutch
      'Debet', 'Af',
    ],
  },
  {
    canonical: 'credit',
    aliases: [
      // English
      'Credit', 'CREDIT', 'Credits', 'Credit Amount', 'Deposit', 'Deposits',
      'Cr', 'CR', 'Cr.', 'Money In', 'Received', 'Paid In', 'Inflow',
      // Spanish
      'Crédito', 'CRÉDITO', 'Abono', 'Abonos', 'Depósito', 'Depósitos',
      // French
      'Crédit', 'Créditeur', 'Entrée',
      // German
      'Haben', 'Gutschrift', 'Einzahlung', 'Eingang',
      // Arabic
      'دائن', 'إيداع', 'الإيداعات',
      // Hindi
      'क्रेडिट', 'जमा',
      // Chinese
      '贷方', '收入', '存款',
      // Portuguese
      'Crédito', 'Entrada',
      // Italian
      'Accredito', 'Avere',
      // Dutch
      'Credit', 'Bij',
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
