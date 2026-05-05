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
}

export interface Reimbursement {
  transaction_id: number;
  transaction_journal_id: number;
  payer_email: string;
  account_name: string;
  original_amount: number;
  amount: number;
}

export interface Balance {
  email: string;
  balance: string;
}

export interface Balances {
  [key: string]: number;
}

