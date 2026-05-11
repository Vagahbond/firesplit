import { SQL } from "bun";
import type { Balance, Currency, Debt, Reimbursement } from "./entities";
import type { User } from "../entities";
import { balancesQuery, currenciesQuery, debtQuery, reimbursementQuery } from "./queries";
import { FireSplitError } from "../errors";


const db = new SQL(process.env.DATABASE_URI ?? "postgres://localhost:5432/firefly-iii");

db.connect().catch(e => {
  console.error(e);
  throw new FireSplitError(`Database connection failed with ${process.env.DATABASE_URI}`, 500);
})



export async function getUserById(id: number): Promise<User | undefined> {

  const user = await db`SELECT * FROM users WHERE id = ${id}`

  if (!user.length)
    return undefined;

  return user[0];
}

export async function getCurrencies(userId: number): Promise<Currency[]> {
  const currencies: Currency[] = await db`${currenciesQuery(userId)}`
  return currencies;
}


export async function getDebtsForUser(user: User, peerEmail: string): Promise<Debt[]> {
  const debts: Debt[] = await db`
${debtQuery(user, peerEmail)}`
  return debts;
}


export async function getReimbursementsForUser(user: User, peerEmail: string): Promise<Reimbursement[]> {
  const reimbursements: Reimbursement[] = await db`
${reimbursementQuery(user, peerEmail)}`

  return reimbursements
}

export async function getBalancesForUser(currency: Currency, user: User): Promise<Balance[]> {

  const query = db`
    ${balancesQuery(currency, user)}`

  const balances: Balance[] = await query

  return balances.map(b => ({ ...b, balance: Number(b.balance).toFixed(2) }))
}

