import type { User, Account, Transaction, UserAttributes } from "./entities";

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
    throw new Error(`Firefly API error: ${res.status} - ${error}`);
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
  console.log(accountName)
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
  accountId: number,
  amount: number,
  payer: UserAttributes,
  payee: UserAttributes
): Promise<Transaction> {
  const payload = {
    transactions: [
      {
        type: "withdrawal",
        amount: amount.toString(),
        source_id: accountId,
        destination_name: payee.email,
        date: new Date().toISOString().split("T")[0],
      },
    ],
  };

  const response = await request<{ data: Transaction }>("/transactions", "", {
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
