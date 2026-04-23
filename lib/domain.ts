import type { Transaction, TransactionSplitAttributes, WebhookTransaction } from "./entities";
import { addOrUpdateLocalUser, getLocalUsers } from "./storage";

export const TAG_PREFIX = "shared:";

export function registerUser(token: string, email: string) {
  addOrUpdateLocalUser(email, token);
}

export function extractSharedTransactionEmails(transaction: WebhookTransaction): string[] {
  return transaction.tags
    .filter(tag => tag.startsWith(TAG_PREFIX))
    .map(t => t.split(":")[1])
    .filter(t => t !== undefined);
}

export function getDebtAccountName(email: string): string {
  return `Dette ${email}`;
}



