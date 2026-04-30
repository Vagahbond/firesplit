import type { WebhookPayload, WebhookTransaction, User, Account, Transaction } from "../lib/api/entities";

// ============================================================
// Fabricated Firefly III Users
// ============================================================

export const mockFireflyUser1: User = {
  id: "1",
  type: "users",
  attributes: {
    id: "1",
    email: "owner@example.com",
    blocked: false,
    blocked_code: null,
    role: "owner",
    mfa_active: false,
    created_at: "2024-01-01T00:00:00+00:00",
    updated_at: "2024-01-01T00:00:00+00:00",
    email_verified_at: "2024-01-01T00:00:00+00:00",
    registration_json: null,
  },
};

export const mockFireflyUser2: User = {
  id: "2",
  type: "users",
  attributes: {
    id: "2",
    email: "partner@example.com",
    blocked: false,
    blocked_code: null,
    role: "owner",
    mfa_active: false,
    created_at: "2024-01-01T00:00:00+00:00",
    updated_at: "2024-01-01T00:00:00+00:00",
    email_verified_at: "2024-01-01T00:00:00+00:00",
    registration_json: null,
  },
};

export const mockFireflyUser3: User = {
  id: "3",
  type: "users",
  attributes: {
    id: "3",
    email: "friend@example.com",
    blocked: false,
    blocked_code: null,
    role: "owner",
    mfa_active: false,
    created_at: "2024-01-01T00:00:00+00:00",
    updated_at: "2024-01-01T00:00:00+00:00",
    email_verified_at: "2024-01-01T00:00:00+00:00",
    registration_json: null,
  },
};

export const mockFireflyUsers: User[] = [mockFireflyUser1, mockFireflyUser2, mockFireflyUser3];

// ============================================================
// Fabricated Firefly III Accounts
// ============================================================

export const mockAssetAccount: Account = {
  id: "1",
  type: "accounts",
  attributes: {
    created_at: "2024-01-01T00:00:00+00:00",
    updated_at: "2024-01-01T00:00:00+00:00",
    name: "Checking Account",
    type: "asset",
    virtual_balance: "1000.00",
    current_balance: "1000.00",
    currency_id: "1",
    currency_code: "EUR",
    currency_symbol: "€",
    currency_decimal_places: 2,
    iban: "FR7612345678901234567890123",
    bic: "BNPAFRPP",
    account_number: "1234567890",
    iban_prefix: "FR76",
    monthly_payment_date: null,
    monthly_payment_type: null,
    liability_type: null,
    liability_start_date: null,
    liability_end_date: null,
    liability_amount: null,
    interest: null,
    interest_period: null,
    category_id: null,
    category_name: null,
    location_id: null,
    location_address: null,
    location_address2: null,
    location_zipcode: null,
    location_city: null,
    location_state: null,
    location_country: null,
    latitude: null,
    longitude: null,
    include_in_totals: true,
    notes: null,
    urls: "",
    last_search: null,
    pay_foreign_currency: false,
    foreign_currency_id: null,
    foreign_currency_code: null,
    foreign_amount: null,
    credit_card_type: null,
    credit_card_inclusion: null,
  },
};

export const mockDebtAccount: Account = {
  id: "10",
  type: "accounts",
  attributes: {
    created_at: "2024-01-01T00:00:00+00:00",
    updated_at: "2024-01-01T00:00:00+00:00",
    name: "Dette partner@example.com",
    type: "liabilities",
    virtual_balance: "0.00",
    current_balance: "0.00",
    currency_id: "1",
    currency_code: "EUR",
    currency_symbol: "€",
    currency_decimal_places: 2,
    iban: null,
    bic: null,
    account_number: null,
    iban_prefix: null,
    monthly_payment_date: null,
    monthly_payment_type: null,
    liability_type: "debt",
    liability_start_date: "2024-01-01",
    liability_end_date: null,
    liability_amount: "0.00",
    interest: "0",
    interest_period: null,
    category_id: null,
    category_name: null,
    location_id: null,
    location_address: null,
    location_address2: null,
    location_zipcode: null,
    location_city: null,
    location_state: null,
    location_country: null,
    latitude: null,
    longitude: null,
    include_in_totals: false,
    notes: "Auto-generated debt account",
    urls: "",
    last_search: null,
    pay_foreign_currency: false,
    foreign_currency_id: null,
    foreign_currency_code: null,
    foreign_amount: null,
    credit_card_type: null,
    credit_card_inclusion: null,
  },
};

export const mockEmptyAccounts: Account[] = [];

// ============================================================
// Fabricated Firefly III Transactions
// ============================================================

export const mockTransaction: Transaction = {
  id: "100",
  type: "transactions",
  attributes: {
    type: "transfer",
    date: "2024-06-15T10:00:00+00:00",
    datetime: "2024-06-15T10:00:00+00:00",
    amount: "50.00",
    description: "Vous avez payé Groceries for partner@example.com",
    transactions: 1,
    currency_id: "1",
    currency_code: "EUR",
    currency_symbol: "€",
    currency_decimal_places: 2,
    budget_id: null,
    budget_name: null,
    category_id: null,
    category_name: null,
    bill_id: null,
    bill_name: null,
    recycle: false,
    source: {
      id: "1",
      name: "Checking Account",
      type: "asset",
      iban: "FR7612345678901234567890123",
    },
    destination: {
      id: "10",
      name: "Dette partner@example.com",
      type: "liabilities",
      iban: null,
    },
    source_iban: "FR7612345678901234567890123",
    destination_iban: null,
    source_type: "asset",
    destination_type: "liabilities",
    notes: null,
    tags: ["shared:partner@example.com", "original:1"],
    internal_reference: null,
    external_id: null,
    external_url: null,
    original_amount: null,
    original_currency: null,
    file_id: null,
    updated_at: "2024-06-15T10:00:00+00:00",
    created_at: "2024-06-15T10:00:00+00:00",
  },
};

// ============================================================
// Fabricated Webhook Payloads
// ============================================================

export function createWebhookTransaction(overrides: Partial<WebhookTransaction> = {}): WebhookTransaction {
  return {
    user: 1,
    transaction_journal_id: "1",
    type: "withdrawal",
    date: "2024-06-15T10:00:00+00:00",
    order: 0,
    currency_id: "1",
    currency_code: "EUR",
    currency_symbol: "€",
    currency_decimal_places: 2,
    foreign_currency_id: "",
    foreign_currency_code: null,
    foreign_currency_symbol: null,
    foreign_currency_decimal_places: null,
    amount: "100.00",
    foreign_amount: null,
    description: "Groceries",
    source_id: "1",
    source_name: "Checking Account",
    source_iban: "FR7612345678901234567890123",
    source_type: "Asset account",
    destination_id: "2",
    destination_name: "Supermarket",
    destination_iban: null,
    destination_type: "Expense account",
    budget_id: "",
    budget_name: null,
    category_id: "",
    category_name: null,
    bill_id: "",
    bill_name: null,
    reconciled: false,
    notes: null,
    tags: [],
    internal_reference: null,
    external_id: null,
    original_source: null,
    recurrence_id: null,
    bunq_payment_id: null,
    import_hash_v2: "abc123",
    sepa_cc: null,
    sepa_ct_op: null,
    sepa_ct_id: null,
    sepa_db: null,
    sepa_country: null,
    sepa_ep: null,
    sepa_ci: null,
    sepa_batch_id: null,
    interest_date: null,
    book_date: null,
    process_date: null,
    due_date: null,
    payment_date: null,
    invoice_date: null,
    longitude: null,
    latitude: null,
    zoom_level: null,
    ...overrides,
  };
}

export function createWebhookPayload(overrides: Partial<WebhookPayload> = {}): WebhookPayload {
  return {
    uuid: "test-uuid-123",
    user_id: 1,
    user_group_id: 1,
    trigger: "STORE_TRANSACTION",
    response: "RELEVANT",
    url: "http://localhost:3000/transaction_webhook",
    version: "v0",
    content: {
      id: 1,
      created_at: "2024-06-15T10:00:00+00:00",
      updated_at: "2024-06-15T10:00:00+00:00",
      user: 1,
      group_title: null,
      transactions: [createWebhookTransaction()],
      links: [{ rel: "self", uri: "/transactions/1" }],
    },
    ...overrides,
  };
}

// Shared transaction with one payee
export const sharedWebhookPayload: WebhookPayload = createWebhookPayload({
  content: {
    id: 1,
    created_at: "2024-06-15T10:00:00+00:00",
    updated_at: "2024-06-15T10:00:00+00:00",
    user: 1,
    group_title: null,
    transactions: [
      createWebhookTransaction({
        transaction_journal_id: "1",
        amount: "100.00",
        description: "Groceries",
        tags: ["shared:partner@example.com"],
      }),
    ],
    links: [{ rel: "self", uri: "/transactions/1" }],
  },
});

// Shared transaction with multiple payees
export const multiPayeeWebhookPayload: WebhookPayload = createWebhookPayload({
  content: {
    id: 2,
    created_at: "2024-06-15T10:00:00+00:00",
    updated_at: "2024-06-15T10:00:00+00:00",
    user: 1,
    group_title: null,
    transactions: [
      createWebhookTransaction({
        transaction_journal_id: "2",
        amount: "300.00",
        description: "Rent",
        tags: ["shared:partner@example.com", "shared:friend@example.com"],
      }),
    ],
    links: [{ rel: "self", uri: "/transactions/2" }],
  },
});

// Non-shared transaction (no shared tags)
export const nonSharedWebhookPayload: WebhookPayload = createWebhookPayload({
  content: {
    id: 3,
    created_at: "2024-06-15T10:00:00+00:00",
    updated_at: "2024-06-15T10:00:00+00:00",
    user: 1,
    group_title: null,
    transactions: [
      createWebhookTransaction({
        transaction_journal_id: "3",
        amount: "50.00",
        description: "Personal expense",
        tags: ["personal", "food"],
      }),
    ],
    links: [{ rel: "self", uri: "/transactions/3" }],
  },
});

// Update transaction webhook
export const updateWebhookPayload: WebhookPayload = createWebhookPayload({
  trigger: "UPDATE_TRANSACTION",
  content: {
    id: 4,
    created_at: "2024-06-15T10:00:00+00:00",
    updated_at: "2024-06-16T10:00:00+00:00",
    user: 1,
    group_title: null,
    transactions: [
      createWebhookTransaction({
        transaction_journal_id: "4",
        amount: "150.00",
        description: "Groceries Updated",
        tags: ["shared:partner@example.com"],
      }),
    ],
    links: [{ rel: "self", uri: "/transactions/4" }],
  },
});

// ============================================================
// Mock API Responses
// ============================================================

export const mockUsersApiResponse = {
  data: mockFireflyUsers,
  meta: {
    pagination: {
      total: 3,
      count: 3,
      per_page: 50,
      current_page: 1,
      total_pages: 1,
    },
  },
};

export const mockAccountsApiResponse = {
  data: [mockAssetAccount],
  meta: {
    pagination: {
      total: 1,
      count: 1,
      per_page: 50,
      current_page: 1,
      total_pages: 1,
    },
  },
};

export const mockAccountsWithDebtApiResponse = {
  data: [mockAssetAccount, mockDebtAccount],
  meta: {
    pagination: {
      total: 2,
      count: 2,
      per_page: 50,
      current_page: 1,
      total_pages: 1,
    },
  },
};

export const mockTransactionsApiResponse = {
  data: [mockTransaction],
  meta: {
    pagination: {
      total: 1,
      count: 1,
      per_page: 50,
      current_page: 1,
      total_pages: 1,
    },
  },
};

export const mockEmptyTransactionsApiResponse = {
  data: [],
  meta: {
    pagination: {
      total: 0,
      count: 0,
      per_page: 50,
      current_page: 1,
      total_pages: 0,
    },
  },
};

export const mockCreatedAccountResponse = {
  data: mockDebtAccount,
  meta: {},
};

export const mockCreatedTransactionResponse = {
  data: mockTransaction,
  meta: {},
};
