
export type AccountType =
  | "asset"
  | "liabilities"
  | "credit"
  | "investment"
  | "savings";

export type TransactionType =
  | "withdrawal"
  | "deposit"
  | "transfer"
  | "reconciliation"
  | "opening balance"
  | "closing balance";

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface AccountAttributes {
  created_at: string;
  updated_at: string;
  name: string;
  type: AccountType;
  virtual_balance: string;
  current_balance: string;
  currency_id: string;
  currency_code: string;
  currency_symbol: string;
  currency_decimal_places: number;
  iban: string | null;
  bic: string | null;
  account_number: string | null;
  iban_prefix: string | null;
  monthly_payment_date: string | null;
  monthly_payment_type: string | null;
  liability_type: string | null;
  liability_start_date: string | null;
  liability_end_date: string | null;
  liability_amount: string | null;
  interest: string | null;
  interest_period: string | null;
  category_id: string | null;
  category_name: string | null;
  location_id: string | null;
  location_address: string | null;
  location_address2: string | null;
  location_zipcode: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  latitude: string | null;
  longitude: string | null;
  include_in_totals: boolean;
  notes: string | null;
  urls: string;
  last_search: unknown;
  pay_foreign_currency: boolean;
  foreign_currency_id: string | null;
  foreign_currency_code: string | null;
  foreign_amount: string | null;
  credit_card_type: string | null;
  credit_card_inclusion: unknown;
}

export interface Account {
  id: string;
  type: string;
  attributes: AccountAttributes;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
}

export interface TransactionBudget {
  id: string;
  name: string;
}

export interface TransactionSourceDestination {
  id: string;
  name: string;
  type: AccountType;
  iban: string | null;
}

export interface TransactionSplitAttributes {
  type: TransactionType;
  date: string;
  datetime: string | null;
  amount: string;
  description: string;
  transactions: number;
  currency_id: string;
  currency_code: string;
  currency_symbol: string;
  currency_decimal_places: number;
  budget_id: string | null;
  budget_name: string | null;
  category_id: string | null;
  category_name: string | null;
  bill_id: string | null;
  bill_name: string | null;
  recycle: boolean;
  source: TransactionSourceDestination | null;
  destination: TransactionSourceDestination | null;
  source_iban: string | null;
  destination_iban: string | null;
  source_type: string | null;
  destination_type: string | null;
  notes: string | null;
  tags: string[];
  internal_reference: string | null;
  external_id: string | null;
  external_url: string | null;
  original_amount: string | null;
  original_currency: string | null;
  file_id: string | null;
  updated_at: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: string;
  attributes: TransactionSplitAttributes;
}

export interface UserAttributes {
  id: string;
  email: string;
  blocked: boolean;
  blocked_code: string | null;
  role: string;
  mfa_active: boolean;
  created_at: string;
  updated_at: string;
  email_verified_at: string | null;
  registration_json: unknown;
}

export interface User {
  id: string;
  type: string;
  attributes: UserAttributes;
}

export interface ApiResponse<T> {
  data: T | T[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
  included?: {
    accounts?: Account[];
    transactions?: Transaction[];
    categories?: TransactionCategory[];
    budgets?: TransactionBudget[];
  };
}

export interface WebhookTransaction {
  user: number;
  transaction_journal_id: string;
  type: string;
  date: string;
  order: number;
  currency_id: string;
  currency_code: string;
  currency_symbol: string;
  currency_decimal_places: number;
  foreign_currency_id: string;
  foreign_currency_code: string | null;
  foreign_currency_symbol: string | null;
  foreign_currency_decimal_places: number | null;
  amount: string;
  foreign_amount: string | null;
  description: string;
  source_id: string;
  source_name: string;
  source_iban: string;
  source_type: string;
  destination_id: string;
  destination_name: string;
  destination_iban: string | null;
  destination_type: string;
  budget_id: string;
  budget_name: string | null;
  category_id: string;
  category_name: string | null;
  bill_id: string;
  bill_name: string | null;
  reconciled: boolean;
  notes: string | null;
  tags: string[];
  internal_reference: string | null;
  external_id: string | null;
  original_source: string | null;
  recurrence_id: string | null;
  bunq_payment_id: string | null;
  import_hash_v2: string;
  sepa_cc: string | null;
  sepa_ct_op: string | null;
  sepa_ct_id: string | null;
  sepa_db: string | null;
  sepa_country: string | null;
  sepa_ep: string | null;
  sepa_ci: string | null;
  sepa_batch_id: string | null;
  interest_date: string | null;
  book_date: string | null;
  process_date: string | null;
  due_date: string | null;
  payment_date: string | null;
  invoice_date: string | null;
  longitude: string | null;
  latitude: string | null;
  zoom_level: string | null;
}

export interface WebhookLink {
  rel: string;
  uri: string;
}

export interface WebhookContent {
  id: number;
  created_at: string;
  updated_at: string;
  user: number;
  group_title: string | null;
  transactions: WebhookTransaction[];
  links: WebhookLink[];
}

export interface WebhookPayload {
  uuid: string;
  user_id: number;
  user_group_id: number;
  trigger: string;
  response: string;
  url: string;
  version: string;
  content: WebhookContent;
}
