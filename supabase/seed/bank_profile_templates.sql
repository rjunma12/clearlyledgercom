-- Seed: bank_profile_templates
-- 5 reusable regional templates for bank profile creation

INSERT INTO public.bank_profile_templates (template_name, description, region, template_patterns)
VALUES

-- 1. US Checking
('us_checking', 'Standard US checking account statement format', 'americas', '{
  "detect_patterns": {
    "accountPatterns": ["\\\\b\\\\d{9,17}\\\\b"],
    "routingNumberPattern": "\\\\b\\\\d{9}\\\\b",
    "uniqueIdentifiers": ["Routing Number", "ABA"],
    "confidenceThreshold": 0.65
  },
  "transaction_patterns": {
    "dateFormats": ["MM/DD/YYYY", "MM-DD-YYYY", "MMM DD, YYYY"],
    "dateSeparator": "/",
    "yearFormat": "4-digit",
    "columnOrder": "date-desc-amount-balance",
    "mergedDebitCredit": true,
    "debitIndicators": ["-", "DR", "Debit"],
    "creditIndicators": ["+", "CR", "Credit"],
    "balancePosition": "right",
    "skipPatterns": ["^account\\\\s+number", "^routing\\\\s+number", "^statement\\\\s+period", "^page\\\\s+\\\\d+"],
    "openingBalancePatterns": ["^beginning\\\\s+balance", "^previous\\\\s+balance"],
    "closingBalancePatterns": ["^ending\\\\s+balance", "^current\\\\s+balance"],
    "multiLineDescriptions": true,
    "maxDescriptionLines": 2
  },
  "validation_rules": {
    "balanceTolerance": 0.01,
    "requireOpeningBalance": false,
    "requireClosingBalance": false,
    "validateRunningBalance": true
  },
  "regional_config": {
    "currencySymbol": "$",
    "symbolPosition": "prefix",
    "negativeFormat": "minus",
    "decimalSeparator": ".",
    "thousandsSeparator": ",",
    "locale": "en-US"
  }
}'::jsonb),

-- 2. European Standard
('european_standard', 'Standard European bank statement format with IBAN detection', 'europe', '{
  "detect_patterns": {
    "accountPatterns": ["\\\\b[A-Z]{2}\\\\d{2}[A-Z0-9]{4}\\\\d{7}([A-Z0-9]?){0,16}\\\\b"],
    "ibanPattern": "\\\\b[A-Z]{2}\\\\d{2}\\\\s?[A-Z0-9]{4}\\\\s?\\\\d{4}\\\\s?\\\\d{4}\\\\s?\\\\d{4}\\\\s?\\\\d{0,4}\\\\b",
    "uniqueIdentifiers": ["IBAN", "BIC", "SWIFT"],
    "confidenceThreshold": 0.65
  },
  "transaction_patterns": {
    "dateFormats": ["DD/MM/YYYY", "DD.MM.YYYY", "DD-MM-YYYY"],
    "dateSeparator": ".",
    "yearFormat": "4-digit",
    "columnOrder": "date-desc-debit-credit-balance",
    "mergedDebitCredit": false,
    "debitIndicators": ["-", "D", "Soll"],
    "creditIndicators": ["+", "C", "Haben"],
    "balancePosition": "right",
    "skipPatterns": ["^kontonummer", "^IBAN", "^BIC", "^seite\\\\s+\\\\d+", "^page\\\\s+\\\\d+"],
    "openingBalancePatterns": ["^alter\\\\s+saldo", "^opening\\\\s+balance", "^solde\\\\s+initial"],
    "closingBalancePatterns": ["^neuer\\\\s+saldo", "^closing\\\\s+balance", "^solde\\\\s+final"],
    "multiLineDescriptions": true,
    "maxDescriptionLines": 3
  },
  "validation_rules": {
    "balanceTolerance": 0.01,
    "requireOpeningBalance": false,
    "requireClosingBalance": false,
    "validateRunningBalance": true
  },
  "regional_config": {
    "currencySymbol": "€",
    "symbolPosition": "suffix",
    "negativeFormat": "minus",
    "decimalSeparator": ",",
    "thousandsSeparator": ".",
    "locale": "en-GB"
  }
}'::jsonb),

-- 3. Indian Standard
('indian_standard', 'Standard Indian bank statement format with IFSC and Lakh/Crore formatting', 'asia', '{
  "detect_patterns": {
    "accountPatterns": ["\\\\b\\\\d{9,18}\\\\b"],
    "ifscPattern": "[A-Z]{4}0[A-Z0-9]{6}",
    "uniqueIdentifiers": ["IFSC", "MICR", "CIF"],
    "confidenceThreshold": 0.65
  },
  "transaction_patterns": {
    "dateFormats": ["DD/MM/YYYY", "DD-MM-YYYY", "DD MMM YYYY"],
    "dateSeparator": "/",
    "yearFormat": "4-digit",
    "columnOrder": "date-desc-debit-credit-balance",
    "mergedDebitCredit": false,
    "debitIndicators": ["Dr", "Debit", "DR", "-"],
    "creditIndicators": ["Cr", "Credit", "CR", "+"],
    "balancePosition": "right",
    "hasReferenceColumn": true,
    "skipPatterns": ["^account\\\\s+number", "^IFSC", "^branch", "^statement\\\\s+of", "^page\\\\s+\\\\d+"],
    "openingBalancePatterns": ["^opening\\\\s+balance", "^balance\\\\s+b/f", "^brought\\\\s+forward"],
    "closingBalancePatterns": ["^closing\\\\s+balance", "^balance\\\\s+c/f", "^carried\\\\s+forward"],
    "multiLineDescriptions": true,
    "maxDescriptionLines": 4,
    "continuationPatterns": ["^UTR", "^IMPS", "^NEFT", "^RTGS", "^UPI", "^\\\\d{12,}"]
  },
  "validation_rules": {
    "balanceTolerance": 0.50,
    "requireOpeningBalance": false,
    "requireClosingBalance": false,
    "validateRunningBalance": true
  },
  "regional_config": {
    "currencySymbol": "₹",
    "symbolPosition": "prefix",
    "negativeFormat": "suffix-dr",
    "decimalSeparator": ".",
    "thousandsSeparator": ",",
    "numberFormat": "1,23,456.78",
    "digitGrouping": "lakh-crore",
    "locale": "en-IN"
  }
}'::jsonb),

-- 4. UK Standard
('uk_standard', 'Standard UK bank statement format with sort code detection', 'europe', '{
  "detect_patterns": {
    "accountPatterns": ["\\\\b\\\\d{8}\\\\b"],
    "sortCodePattern": "\\\\b\\\\d{2}-\\\\d{2}-\\\\d{2}\\\\b",
    "uniqueIdentifiers": ["Sort Code", "Account Number"],
    "confidenceThreshold": 0.65
  },
  "transaction_patterns": {
    "dateFormats": ["DD/MM/YYYY", "DD MMM YYYY", "DD-MM-YYYY"],
    "dateSeparator": "/",
    "yearFormat": "4-digit",
    "columnOrder": "date-desc-debit-credit-balance",
    "mergedDebitCredit": false,
    "debitIndicators": ["OUT", "DR", "-", "D"],
    "creditIndicators": ["IN", "CR", "+", "C"],
    "balancePosition": "right",
    "skipPatterns": ["^account\\\\s+number", "^sort\\\\s+code", "^statement\\\\s+date", "^page\\\\s+\\\\d+"],
    "openingBalancePatterns": ["^opening\\\\s+balance", "^balance\\\\s+brought\\\\s+forward"],
    "closingBalancePatterns": ["^closing\\\\s+balance", "^balance\\\\s+carried\\\\s+forward"],
    "multiLineDescriptions": true,
    "maxDescriptionLines": 2
  },
  "validation_rules": {
    "balanceTolerance": 0.01,
    "requireOpeningBalance": false,
    "requireClosingBalance": false,
    "validateRunningBalance": true
  },
  "regional_config": {
    "currencySymbol": "£",
    "symbolPosition": "prefix",
    "negativeFormat": "minus",
    "decimalSeparator": ".",
    "thousandsSeparator": ",",
    "locale": "en-GB"
  }
}'::jsonb),

-- 5. Asian Standard
('asian_standard', 'Standard Asian bank statement format for SEA and East Asia', 'asia', '{
  "detect_patterns": {
    "accountPatterns": ["\\\\b\\\\d{10,16}\\\\b"],
    "uniqueIdentifiers": ["SWIFT", "Branch Code"],
    "confidenceThreshold": 0.60
  },
  "transaction_patterns": {
    "dateFormats": ["DD/MM/YYYY", "DD MMM YYYY", "YYYY/MM/DD", "DD-MM-YYYY"],
    "dateSeparator": "/",
    "yearFormat": "4-digit",
    "columnOrder": "date-desc-withdrawal-deposit-balance",
    "mergedDebitCredit": false,
    "debitIndicators": ["-", "DR", "Withdrawal"],
    "creditIndicators": ["+", "CR", "Deposit"],
    "balancePosition": "right",
    "hasReferenceColumn": true,
    "skipPatterns": ["^account\\\\s+number", "^statement\\\\s+date", "^page\\\\s+\\\\d+", "^branch"],
    "openingBalancePatterns": ["^opening\\\\s+balance", "^balance\\\\s+b/f", "^brought\\\\s+forward"],
    "closingBalancePatterns": ["^closing\\\\s+balance", "^balance\\\\s+c/f", "^carried\\\\s+forward"],
    "multiLineDescriptions": true,
    "maxDescriptionLines": 2
  },
  "validation_rules": {
    "balanceTolerance": 0.01,
    "requireOpeningBalance": false,
    "requireClosingBalance": false,
    "validateRunningBalance": true
  },
  "regional_config": {
    "currencySymbol": null,
    "symbolPosition": "prefix",
    "negativeFormat": "minus",
    "decimalSeparator": ".",
    "thousandsSeparator": ",",
    "locale": "en-GB"
  }
}'::jsonb);
