
import type { BunRequest } from "bun";
import { authenticateUser, AuthTokenName } from "../lib/authService";
import type { User } from "../lib/entities";
import { FireSplitError } from "../lib/errors";
import { renderBalancesPage } from "../lib/render/balances";
import { renderReportPage } from "../lib/render/reports";
import { getBalancesForUser, getCurrencies, getDebtsForUser, getReimbursementsForUser } from "../lib/repository/repository";
import type { Currency } from "../lib/repository/entities";

export function mkWebResponse(body: string, status: number = 500) {
        return new Response(body, { status: status, headers: { "Content-Type": "text/html" } });
}

async function grabUser(req: BunRequest): Promise<User> {

        const token = req.cookies.get(AuthTokenName)

        if (!token) {
                throw new FireSplitError("Token not found", 401);
        }

        const user = await authenticateUser(token).catch(async _ => {
                throw new FireSplitError("User not found", 401);
        });

        if (!user || user instanceof Response) {
                throw new FireSplitError("User not found", 401);
        }

        return user;
}


async function grabCurrency(req: BunRequest): Promise<[Currency[], Currency]> {

        let cur = req.cookies.get("currency");

        const ffCurrencies = await getCurrencies();

        if (!cur && ffCurrencies[0]?.currency_code) {
                cur = ffCurrencies[0]?.currency_code;
        }

        if (!cur) {
                throw new FireSplitError("Currency not found", 401);
        }

        const currentCurrency = ffCurrencies.find(c => c.to_currency_code.toLowerCase() === cur.toLowerCase());

        if (!currentCurrency) {
                throw new FireSplitError("Currency not found", 401);
        }

        return [ffCurrencies, currentCurrency];
}

async function grabEmail(req: BunRequest): Promise<string> {
        const email = req.params.email

        if (!email) {
                throw new FireSplitError("Email not found", 401);
        }

        return email;
}

export async function homePage(req: BunRequest) {
        const user = await grabUser(req)

        const [currencies, currency] = await grabCurrency(req)

        const balances = await getBalancesForUser(user)

        const balancesPage = await renderBalancesPage({ balances, currentCurrency: currency, currencies: currencies });

        return mkWebResponse(balancesPage, 200);
}

export async function reportPage(req: BunRequest) {

        const user = await grabUser(req)
        const email = await grabEmail(req)
        const [currencies, currency] = await grabCurrency(req)

        const debts = await getDebtsForUser(user, email)

        const reimbursements = await getReimbursementsForUser(user, email)

        const currentBalances = await getBalancesForUser(user)

        const currentBalance = currentBalances.find(b => b.email === email)?.balance ?? 0



        const reportPage = await renderReportPage({ email, debts, reimbursements, currentBalance, currentCurrency: currency, currencies });
        return mkWebResponse(reportPage, 200);
}
