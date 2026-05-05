export interface JsonApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  links?: Record<string, string>;
}

export interface JsonApiCollectionResponse<T> {
  data: T[];
  meta?: {
    pagination?: Pagination;
  };
  links?: Record<string, string>;
}

export interface JsonApiResource<T> {
  type: string;
  id: string;
  attributes: T;
  relationships?: Record<string, JsonApiRelationship>;
  links?: Record<string, string>;
}

export interface JsonApiRelationship {
  data: {
    type: string;
    id: string;
  } | {
    type: string;
    id: string;
  }[];
  links?: Record<string, string>;
}

export interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface UserAttributes {
  email: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface User extends JsonApiResource<UserAttributes> {
  type: 'users';
}

export interface TagAttributes {
  tag: string;
  description?: string;
  date?: string;
  latitude?: number;
  longitude?: number;
  zoom_level?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag extends JsonApiResource<TagAttributes> {
  type: 'tags';
}

export interface TransactionAttributes {
  transaction_journal_id: number;
  account_id: number;
  account_name: string;
  amount: string;
  foreign_amount?: string;
  foreign_currency_code?: string;
  currency_code: string;
  currency_symbol: string;
  currency_decimal_places: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction extends JsonApiResource<TransactionAttributes> {
  type: 'transactions';
}

export interface TransactionJournalAttributes {
  transaction_group_id: number;
  type: 'withdrawal' | 'deposit' | 'transfer';
  description: string;
  date: string;
  amount: string;
  currency_code: string;
  currency_symbol: string;
  currency_decimal_places: number;
  foreign_amount?: string;
  foreign_currency_code?: string;
  budget_id?: number;
  budget_name?: string;
  category_id?: number;
  category_name?: string;
  tags?: string[];
  reconciled: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionJournal extends JsonApiResource<TransactionJournalAttributes> {
  type: 'transaction_journals';
}

export interface AccountAttributes {
  name: string;
  type: 'asset' | 'expense' | 'revenue' | 'cash' | 'liability' | 'liabilities' | 'initial-balance' | 'reconciliation';
  account_role?: 'defaultAsset' | 'sharedAsset' | 'savingAsset' | 'ccAsset' | 'cashWalletAsset';
  active: boolean;
  balance: string;
  currency_id: number;
  currency_code: string;
  currency_symbol: string;
  currency_decimal_places: number;
  iban?: string;
  account_number?: string;
  opening_balance?: string;
  opening_balance_date?: string;
  virtual_balance: string;
  include_net_worth: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Account extends JsonApiResource<AccountAttributes> {
  type: 'accounts';
}
