import { describe, expect, test, spyOn, afterEach } from "bun:test";
import {
  mockUsersApiResponse,
  mockAccountsApiResponse,
  mockTransactionsApiResponse,
  mockEmptyTransactionsApiResponse,
  mockCreatedAccountResponse,
  mockCreatedTransactionResponse,
} from "./fixtures";

// ============================================================
// API Controller Tests (with mocked fetch)
// ============================================================

describe("API Controller - getUsers", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("returns array of users from Firefly API", async () => {
    const { getUsers } = await import("../lib/api/controller");

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockUsersApiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const users = await getUsers("test-token");

    expect(users).toHaveLength(3);
    expect(users[0]?.attributes.email).toBe("owner@example.com");
  });
});

describe("API Controller - getUserAccounts", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("returns array of accounts from Firefly API", async () => {
    const { getUserAccounts } = await import("../lib/api/controller");

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockAccountsApiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const accounts = await getUserAccounts("test-token");

    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.attributes.name).toBe("Checking Account");
  });
});

describe("API Controller - getAccountTransactions", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("returns transactions for an account", async () => {
    const { getAccountTransactions } = await import("../lib/api/controller");

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockTransactionsApiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const transactions = await getAccountTransactions("10", "test-token");

    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.attributes.description).toBe("Vous avez payé Groceries for partner@example.com");
  });

  test("returns empty array when no transactions", async () => {
    const { getAccountTransactions } = await import("../lib/api/controller");

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockEmptyTransactionsApiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const transactions = await getAccountTransactions("10", "test-token");

    expect(transactions).toHaveLength(0);
  });
});

describe("API Controller - createDebtAccount", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("creates a new debt account with correct payload", async () => {
    const { createDebtAccount } = await import("../lib/api/controller");

    const mockFetch = async (..._args: unknown[]) => {
      const options = _args[1] as { body?: string };
      const body = JSON.parse(options?.body ?? "{}");
      expect(body.type).toBe("liabilities");
      expect(body.liability_type).toBe("debt");
      expect(body.name).toBe("Dette test@example.com");
      expect(body.interest).toBe(0);
      expect(body.include_net_worth).toBe(false);

      return new Response(JSON.stringify(mockCreatedAccountResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as typeof fetch);

    const account = await createDebtAccount("Dette test@example.com", "test-token");

    expect(account.attributes.name).toBe("Dette partner@example.com");
    expect(account.attributes.type).toBe("liabilities");
  });
});

describe("API Controller - createTransaction", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("creates a new transaction with correct payload", async () => {
    const { createTransaction } = await import("../lib/api/controller");

    const mockFetch = async (..._args: unknown[]) => {
      const options = _args[1] as { body?: string };
      const body = JSON.parse(options?.body ?? "{}");
      expect(body.transactions[0].type).toBe("transfer");
      expect(body.transactions[0].amount).toBe(50);
      expect(body.fire_webhooks).toBe(false);
      expect(body.apply_rules).toBe(false);
      expect(body.transactions[0].source_name).toBe("Source Account");
      expect(body.transactions[0].destination_name).toBe("Destination Account");

      return new Response(JSON.stringify(mockCreatedTransactionResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as typeof fetch);

    const transaction = await createTransaction(
      "Test transaction",
      50,
      "Source Account",
      "Destination Account",
      new Date("2024-06-15"),
      "1",
      "test-token"
    );

    expect(transaction.attributes.description).toBe("Vous avez payé Groceries for partner@example.com");
  });
});

describe("API Controller - updateTransaction", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("updates an existing transaction with correct payload", async () => {
    const { updateTransaction } = await import("../lib/api/controller");

    const mockFetch = async (..._args: unknown[]) => {
      const url = _args[0] as string;
      const options = _args[1] as { body?: string };
      expect(url.toString()).toContain("/transactions/100");
      const body = JSON.parse(options?.body ?? "{}");
      expect(body.transactions[0].amount).toBe(75);
      expect(body.transactions[0].description).toBe("Updated description");

      return new Response(JSON.stringify(mockCreatedTransactionResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as typeof fetch);

    const transaction = await updateTransaction(
      "Updated description",
      "100",
      75,
      "Source Account",
      "Destination Account",
      "test-token"
    );

    expect(transaction).toBeDefined();
  });
});

describe("API Controller - Error Handling", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  test("throws ApiError when API returns error status", async () => {
    const { getUsers } = await import("../lib/api/controller");
    const { ApiError } = await import("../lib/api/errors");

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(getUsers("invalid-token")).rejects.toThrow(ApiError);
  });

  test("ApiError contains correct status code", async () => {
    const { getUsers } = await import("../lib/api/controller");
    const { ApiError } = await import("../lib/api/errors");

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    );

    try {
      await getUsers("test-token");
    } catch (error) {
      expect(error instanceof ApiError).toBe(true);
      expect((error as InstanceType<typeof ApiError>).status).toBe(404);
    }
  });
});
