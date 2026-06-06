import { SQL } from "bun";
import type { Balance, Currency, Debt, Reimbursement } from "./entities";
import type { User } from "../entities";
import { balancesQuery, currenciesQuery, debtQuery, reimbursementQuery } from "./queries";
import { FireSplitError } from "../errors";


const databaseUri = process.env.DATABASE_URI

const db = databaseUri ?
        new SQL(databaseUri) :
        new SQL(
                {
                        path: "/run/postgresql"
                });


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

export async function getCurrencies(): Promise<Currency[]> {
        const currencies: Currency[] = await db`${currenciesQuery()}`
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

export async function getBalancesForUser(user: User): Promise<Balance[]> {

        const query = db`
    ${balancesQuery(user)}`

        const balances: Balance[] = await query

        return balances.map(b => ({ ...b, balance: Number(b.balance).toFixed(2) }))
}

