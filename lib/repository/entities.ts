export interface Debt {
  transaction_id: number;
  transaction_journal_id: number;
  payer_email: string;
  source_account: string;
  tag: string;
  payee_email: string;
  date: string;
  nb_payees: number;
  original_amount: number;
  amount: number;
  description?: string;
  currency_symbol: string;
  currency_code: string;
  currency_rate: number;
  normalized_amount: number;
}

export interface Reimbursement {
  date: string;
  transaction_id: number;
  transaction_journal_id: number;
  payer_email: string;
  account_name: string;
  original_amount: number;
  amount: number;
  description?: string;
  currency_symbol: string;
  currency_code: string;
  currency_rate: number;
  normalized_amount: number;
}

export interface Balance {
  email: string;
  balance: number;
}

export interface Balances {
  [key: string]: number;
}

export interface Currency {
  currency_id: number;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  to_currency_id: number;
  to_currency_code: string;
  to_currency_name: string;
  to_currency_symbol: string;
  rate: number
}
