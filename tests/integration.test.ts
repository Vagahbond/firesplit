import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { routes, notFoundHandler } from "../index";
import {
  sharedWebhookPayload,
  nonSharedWebhookPayload,
  multiPayeeWebhookPayload,
  updateWebhookPayload,
} from "./fixtures";
import * as repository from "../lib/repository";

// ============================================================
// Integration Tests for Server Endpoints
// ============================================================

function createTestServer() {
  return Bun.serve({
    port: 0,
    routes,
    fetch: notFoundHandler,
  });
}

describe("Server - /user/register endpoint", () => {
  let server: ReturnType<typeof createTestServer>;

  beforeEach(() => {
    server = createTestServer();
  });

  afterEach(() => {
    server.stop();
  });

  test("returns 400 when missing token", async () => {
    const response = await fetch(`http://localhost:${server.port}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error?: string };
    expect(data.error).toBe("Missing token or email");
  });

  test("returns 400 when missing email", async () => {
    const response = await fetch(`http://localhost:${server.port}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "test-token" }),
    });

    expect(response.status).toBe(400);
  });

  test("returns 200 with valid token and email", async () => {
    const response = await fetch(`http://localhost:${server.port}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "test-token", email: "test@example.com" }),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as { success?: boolean };
    expect(data.success).toBe(true);

    const localUsers = repository.getLocalUsers();
    expect(localUsers.some(u => u.email === "test@example.com")).toBe(true);
  });
});

describe("Server - /transaction_webhook endpoint", () => {
  let server: ReturnType<typeof createTestServer>;

  beforeEach(() => {
    server = createTestServer();
  });

  afterEach(() => {
    server.stop();
  });

  test("returns 200 for valid webhook payload", async () => {
    const response = await fetch(`http://localhost:${server.port}/transaction_webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sharedWebhookPayload),
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("OK");
  });

  test("returns 404 for unknown routes", async () => {
    const response = await fetch(`http://localhost:${server.port}/unknown`);

    expect(response.status).toBe(404);
  });
});

describe("Webhook Payload Structure", () => {
  test("shared webhook payload has correct structure", () => {
    expect(sharedWebhookPayload.uuid).toBeDefined();
    expect(sharedWebhookPayload.content.transactions).toHaveLength(1);
    expect(sharedWebhookPayload.content.transactions[0]?.tags).toContain("shared:partner@example.com");
  });

  test("multi-payee webhook payload has multiple shared tags", () => {
    expect(multiPayeeWebhookPayload.content.transactions).toHaveLength(1);
    const tags = multiPayeeWebhookPayload.content.transactions[0]?.tags ?? [];
    expect(tags).toContain("shared:partner@example.com");
    expect(tags).toContain("shared:friend@example.com");
  });

  test("non-shared webhook payload has no shared tags", () => {
    const tags = nonSharedWebhookPayload.content.transactions[0]?.tags ?? [];
    const sharedTags = tags.filter((t) => t.startsWith("shared:"));
    expect(sharedTags).toHaveLength(0);
  });

});
