import { createDebtAccount, createTransaction, getAccountTransactions, getUserAccounts, getUsers, updateTransaction } from "../api/fetcher";
import type { Account, User, WebhookTransaction } from "../api/entities";
import { addOrUpdateLocalUser, getLocalUsers, type LocalDbUser } from "../repository";
import type { PreparedTransaction, PreparedUser } from "./entities";
import { FireflyUserNotFoundError, LocalUserNotFoundError, NoUsersRegisteredError, UserPreparationError } from "./errors";

export const TAG_PREFIX = "shared:";

export function registerUser(token: string, email: string) {
  addOrUpdateLocalUser(email, token);
}

export function extractSharedTransactionEmails(transactionSplit: WebhookTransaction): string[] {
  return transactionSplit.tags
    .filter(tag => tag.startsWith(TAG_PREFIX))
    .map(t => t.split(":")[1])
    .filter(t => t !== undefined);
}

function getDebtAccountName(email: string): string {
  return `Dette ${email}`;
}

function getPaidForTransactionDescription(payee: PreparedUser, description: string): string {
  return `Vous avez payé ${description} pour ${payee.email}`;
}

function getUnpaidForTransactionDescription(payer: PreparedUser, description: string): string {
  return `${payer.email} a payé pour ${description}`;
}

function preparePayees(localUsers: LocalDbUser[], fireflyUsers: User[], payeeEmails: string[]): PreparedUser[] {
  return payeeEmails.map(email => prepareUser(localUsers, fireflyUsers, { email }));
}

function prepareUser(localUsers: LocalDbUser[], fireflyUsers: User[], user: { id?: number, email?: string }): PreparedUser {

  let ffUser;
  if (user.email)
    ffUser = fireflyUsers.find(u => u.attributes.email === user.email);
  else if (user.id)
    ffUser = fireflyUsers.find(u => u.id.toString() === user.id?.toString());
  else
    throw new UserPreparationError("User could not be prepared: no id or email provided");

  if (!ffUser) {
    throw new FireflyUserNotFoundError({ id: user.id, email: user.email });
  }

  const userToken = localUsers.find(u => u.email === ffUser.attributes.email)?.token;


  if (!userToken) {
    throw new LocalUserNotFoundError(ffUser.attributes.email);
  }

  return {
    email: ffUser.attributes.email,
    token: userToken,
    id: ffUser.id,
  };

}

async function getOrCreatePeerAccount(owner: PreparedUser, owed: PreparedUser): Promise<Account> {
  const userAccounts = await getUserAccounts(owner.token);
  const peerAccountName = getPeerAccountName(owed.email);
  let peerAccount = userAccounts.find(a => a.attributes.name === peerAccountName);
  if (!peerAccount) {
    peerAccount = await createPeerAccount(peerAccountName, owner.token);
  }
  return peerAccount;
}

async function getOrCreateDebtAccount(owner: PreparedUser, owed: PreparedUser): Promise<Account> {

  const userAccounts = await getUserAccounts(owner.token);

  const debtAccountName = getDebtAccountName(owed.email);

  let debtAccount = userAccounts.find(a => a.attributes.name === debtAccountName);

  if (!debtAccount) {
    debtAccount = await createDebtAccount(debtAccountName, owner.token);
  }

  return debtAccount;

}


export async function prepareTransaction(transaction: WebhookTransaction): Promise<PreparedTransaction | undefined> {
  const localUsers = getLocalUsers();

  const payeeEmails = extractSharedTransactionEmails(transaction);

  // the new transaction is not a shared transaction
  if (payeeEmails.length === 0) {
    return undefined;
  }


  if (!localUsers[0]) {
    throw new NoUsersRegisteredError();
  }

  const fireflyUsers = await getUsers(localUsers[0].token);

  const preparedPayer = prepareUser(localUsers, fireflyUsers, { id: transaction.user });

  const preparedPayees = preparePayees(localUsers, fireflyUsers, payeeEmails);


  const currency_id = transaction.currency_id

  return {
    id: transaction.transaction_journal_id,
    amount: Number.parseFloat(transaction.amount),
    currency_id,
    date: new Date(transaction.date),
    description: transaction.description,
    payee: preparedPayees,
    payer: preparedPayer
  }
}

export async function createPeerTransactions(transaction: PreparedTransaction): Promise<void> {
  for (let p of transaction.payee) {

    const payeeAccount = await getOrCreateDebtAccount(p, transaction.payer);

    const payeePeerAcount = await getOrCreatePeerAccount(p, transaction.payer);

    const payeeAcountTransactions = await getAccountTransactions(payeeAccount.id, p.token);

    const payeeTransactionName = getUnpaidForTransactionDescription(p, transaction.description);

    const amountPerPayee = transaction.amount / transaction.payee.length;

    const existingPayeeTransaction = payeeAcountTransactions.find(t => t.attributes.description === payeeTransactionName)


    if (existingPayeeTransaction) {
      await updateTransaction(payeeTransactionName, existingPayeeTransaction.id, amountPerPayee, transaction.payer.email, payeeAccount.attributes.name, p.token);
      continue;
    }

    await createTransaction(payeeTransactionName, amountPerPayee, transaction.payer.email, payeeAccount.attributes.name, transaction.date, transaction.currency_id, p.token);


    const payerAccount = await getOrCreateDebtAccount(transaction.payer, p);

    const payerPeerAcount = await getOrCreatePeerAccount(p, transaction.payer);

    const payerAcountTransactions = await getAccountTransactions(payerAccount.id, p.token);

    const payerTransactionName = getPaidForTransactionDescription(p, transaction.description);

    const existingPayerTransaction = payerAcountTransactions.find(t => t.attributes.description === payerTransactionName)

    if (existingPayerTransaction) {
      await updateTransaction(payerTransactionName, existingPayerTransaction.id, amountPerPayee, payerAccount.attributes.name, p.email, transaction.payer.token);
      continue;
    }

    await createTransaction(payerTransactionName, amountPerPayee, payerAccount.attributes.name, p.email, transaction.date, transaction.currency_id, transaction.payer.token);

  }
}
