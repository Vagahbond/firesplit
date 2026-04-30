import { describe, expect, test } from "bun:test";
import { FiresplitError } from "../lib/errors";
import { ApiError } from "../lib/api/errors";
import {
  NoUsersRegisteredError,
  FireflyUserNotFoundError,
  LocalUserNotFoundError,
  DebtAcccountNotCreatedError,
  UserPreparationError,
} from "../lib/domain/errors";

// ============================================================
// Error Classes Tests
// ============================================================

describe("FiresplitError", () => {
  test("creates error with default status 500", () => {
    const error = new FiresplitError("Test error");

    expect(error.status).toBe(500);
    expect(error.message).toContain("Test error");
    expect(error.message).toContain("Firesplit");
  });

  test("creates error with custom status", () => {
    const error = new FiresplitError("Not found", 404);

    expect(error.status).toBe(404);
  });

  test("message contains service name and timestamp", () => {
    const error = new FiresplitError("Test error");

    const parsed = JSON.parse(error.message);
    expect(parsed.service).toBe("Firesplit");
    expect(parsed.error).toBe("Test error");
    expect(parsed.time).toBeDefined();
  });
});

describe("ApiError", () => {
  test("extends FiresplitError", () => {
    const error = new ApiError("API error");

    expect(error instanceof FiresplitError).toBe(true);
  });

  test("creates error with status", () => {
    const error = new ApiError("Unauthorized", 401);

    expect(error.status).toBe(401);
  });

  test("defaults to status 500", () => {
    const error = new ApiError("Server error");

    expect(error.status).toBe(500);
  });
});

describe("NoUsersRegisteredError", () => {
  test("creates error with correct message and status", () => {
    const error = new NoUsersRegisteredError();

    expect(error.status).toBe(404);
    expect(error.message).toContain("No users registered");
  });
});

describe("FireflyUserNotFoundError", () => {
  test("creates error with email", () => {
    const error = new FireflyUserNotFoundError({ email: "test@example.com" });

    expect(error.status).toBe(404);
    expect(error.message).toContain("test@example.com");
  });

  test("creates error with id", () => {
    const error = new FireflyUserNotFoundError({ id: 123 });

    expect(error.status).toBe(404);
    expect(error.message).toContain("123");
  });
});

describe("LocalUserNotFoundError", () => {
  test("creates error with email", () => {
    const error = new LocalUserNotFoundError("test@example.com");

    expect(error.status).toBe(404);
    expect(error.message).toContain("test@example.com");
    expect(error.message).toContain("not registered");
  });
});

describe("DebtAcccountNotCreatedError", () => {
  test("creates error with account name and owner", () => {
    const error = new DebtAcccountNotCreatedError("Dette test@example.com", "owner@example.com");

    expect(error.status).toBe(404);
    expect(error.message).toContain("Dette test@example.com");
    expect(error.message).toContain("owner@example.com");
  });
});

describe("UserPreparationError", () => {
  test("creates error with message", () => {
    const error = new UserPreparationError("Preparation failed");

    expect(error.status).toBe(500);
    expect(error.message).toContain("Preparation failed");
  });
});
