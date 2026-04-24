import type { User, Account, Transaction, UserAttributes } from "./entities";
import { ApiError } from "./errors";

const API_BASE = process.env.FIREFLY_API_URL || "http://localhost:8080/api/v1";

async function request<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new ApiError(`Firefly API error: ${error}`, res.status);
  }

  return res.json() as Promise<T>;
}

export async function getUsers(token: string): Promise<User[]> {
  const response = await request<{ data: User[] }>("/users", token);
  return response.data;
}

export async function getUserAccounts(token: string): Promise<Account[]> {
  const response = await request<{ data: Account[] }>(`/accounts`, token);
  return response.data;
}

export async function getAccountTransactions(
  accountId: string,
  token: string
): Promise<Transaction[]> {
  const response = await request<{ data: Transaction[] }>(`/accounts/${accountId}/transactions`, token);
  return response.data;
}

export async function createDebtAccount(
  accountName: string,
  token: string
): Promise<Account> {
  const payload = {
    name: accountName,
    type: "liabilities",
    interest: 0,
    include_net_worth: false,
    liability_type: "debt",
    liability_direction: "debit",
    notes: `Dette avec ${accountName}. Si le nombre est negatif, alors cette personne vous doit. Ce compte est auto-gere, il ne faut pas y toucher`
  };

  const response = await request<{ data: Account }>("/accounts", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function createTransaction(
  description: string,
  amount: number,
  sourceName: string,
  destinationName: string,
  date: Date,

  currency_id: string,
  token: string
): Promise<Transaction> {
  const payload = {
    error_if_duplicate_hash: false,
    apply_rules: false,
    fire_webhooks: false,
    transactions: [
      {
        description,
        type: "transfer",
        amount,
        source_name: sourceName,
        destination_name: destinationName,
        date: date.toISOString(),
        currency_id: currency_id,
      },
    ],
  };

  const response = await request<{ data: Transaction }>("/transactions", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateTransaction(
  description: string,
  transactionId: string,
  amount: number,
  sourceName: string,
  destinationName: string,
  token: string
): Promise<Transaction> {

  const payload = {
    error_if_duplicate_hash: false,
    apply_rules: false,
    fire_webhooks: false,
    transactions: [
      {
        description,
        type: "transfer",
        amount,
        source_name: sourceName,
        destination_name: destinationName
      },
    ],
  };

  const response = await request<{ data: Transaction }>(`/transactions/${transactionId}`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export interface Webhook {
  id: string;
  title: string;
  url: string;
  active: boolean;
  events: string[];
  secret: string;
}

export async function createWebhook(
  token: string,
  title: string,
  url: string,
  events: string[]
): Promise<Webhook> {
  const payload = {
    title,
    url,
    events,
    active: true,
  };

  const response = await request<{ data: Webhook }>("/webhooks", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}
