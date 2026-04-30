import { describe, expect, test } from "bun:test";
import { extractSharedTransactionEmails, TAG_PREFIX } from "../lib/domain/domain";
import { createWebhookTransaction } from "./fixtures";

// ============================================================
// extractSharedTransactionEmails Tests
// ============================================================

describe("extractSharedTransactionEmails", () => {
  test("extracts single shared email from tags", () => {
    const transaction = createWebhookTransaction({
      tags: ["food", "shared:partner@example.com"],
    });

    const emails = extractSharedTransactionEmails(transaction);

    expect(emails).toEqual(["partner@example.com"]);
  });

  test("extracts multiple shared emails from tags", () => {
    const transaction = createWebhookTransaction({
      tags: ["shared:alice@example.com", "food", "shared:bob@example.com"],
    });

    const emails = extractSharedTransactionEmails(transaction);

    expect(emails).toEqual(["alice@example.com", "bob@example.com"]);
  });

  test("returns empty array when no shared tags", () => {
    const transaction = createWebhookTransaction({
      tags: ["food", "personal"],
    });

    const emails = extractSharedTransactionEmails(transaction);

    expect(emails).toEqual([]);
  });

  test("returns empty array when tags array is empty", () => {
    const transaction = createWebhookTransaction({
      tags: [],
    });

    const emails = extractSharedTransactionEmails(transaction);

    expect(emails).toEqual([]);
  });

  test("extracts email even when shared tag is first", () => {
    const transaction = createWebhookTransaction({
      tags: ["shared:partner@example.com", "food"],
    });

    const emails = extractSharedTransactionEmails(transaction);

    expect(emails).toEqual(["partner@example.com"]);
  });

});
