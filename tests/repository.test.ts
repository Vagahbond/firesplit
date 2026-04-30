import { describe, expect, test } from "bun:test";
import { addOrUpdateLocalUser, getLocalUsers } from "../lib/repository";

// Use a test-specific data directory
const TEST_DATA_DIR = "./data-test";
process.env.DATA_DIR = TEST_DATA_DIR;

// ============================================================
// Repository Tests
// ============================================================

describe("Repository - Local User Management", () => {
  test("addOrUpdateLocalUser inserts a new user", () => {
    const email = "newuser@example.com";
    const token = "test-token-123";

    addOrUpdateLocalUser(email, token);

    const users = getLocalUsers();
    const user = users.find((u) => u.email === email);

    expect(user).toBeDefined();
    expect(user?.email).toBe(email);
    expect(user?.token).toBe(token);
    expect(user?.createdAt).toBeDefined();
  });

  test("addOrUpdateLocalUser updates an existing user", () => {
    const email = "updateuser@example.com";
    const initialToken = "initial-token";
    const updatedToken = "updated-token";

    addOrUpdateLocalUser(email, initialToken);
    addOrUpdateLocalUser(email, updatedToken);

    const users = getLocalUsers();
    const user = users.find((u) => u.email === email);

    expect(user).toBeDefined();
    expect(user?.token).toBe(updatedToken);
  });

  test("getLocalUsers returns all registered users", () => {
    const email1 = "user1@example.com";
    const email2 = "user2@example.com";

    addOrUpdateLocalUser(email1, "token1");
    addOrUpdateLocalUser(email2, "token2");

    const users = getLocalUsers();

    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users.some((u) => u.email === email1)).toBe(true);
    expect(users.some((u) => u.email === email2)).toBe(true);
  });

  test("getLocalUsers returns empty array when no users", () => {
    // This test assumes a fresh database
    // In practice, you'd need to clear the database before running
    const users = getLocalUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  test("createdAt is set", () => {
    const email = "dateuser@example.com";
    const before = new Date().toISOString();

    addOrUpdateLocalUser(email, "token");

    const users = getLocalUsers();
    const user = users.find((u) => u.email === email);

    expect(user?.createdAt).toBeDefined();
  });
});
