import { SQL } from "bun";
import type { Balance, Currency, Debt, Reimbursement } from "./entities";
import type { User } from "../entities";
import { balancesQuery, currenciesQuery, debtQuery, GROUPED_PAYEES_CTE, reimbursementQuery } from "./queries";


const db = new SQL(process.env.DATABASE_URL ?? "postgres://localhost:5432/firefly-iii");


export async function getUserById(id: number): Promise<User | undefined> {

  const user = await db`SELECT * FROM users WHERE id = ${id}`

  if (!user.length)
    return undefined;

  return user[0];
}

export async function getCurrencies(base_money: string, userId: number): Promise<Currency[]> {
  const currencies: Currency[] = await db`${currenciesQuery(base_money, userId)}`
  return currencies;
}


export async function getDebtsForUser(email: string, peerEmail: string): Promise<Debt[]> {
  const debts: Debt[] = await db`
${GROUPED_PAYEES_CTE}
${debtQuery(email, peerEmail)}`
  return debts;
}


export async function getReimbursementsForUser(email: string, peerEmail: string): Promise<Reimbursement[]> {
  const reimbursements: Reimbursement[] = await db`
${GROUPED_PAYEES_CTE}
${reimbursementQuery(email, peerEmail)}`

  return reimbursements
}

export async function getBalancesForUser(email: string): Promise<Balance[]> {

  const query = db`
${GROUPED_PAYEES_CTE}
${balancesQuery(email)}`

  const balances: Balance[] = await query

  return balances.map(b => ({ ...b, balance: Number(b.balance).toFixed(2) }))
}

