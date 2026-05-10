import type { Balance, Currency } from "../repository/entities";
import pug from "pug";
import { TEMPLATES_DIR } from "./const";
import { renderLayout } from "./layout";

export interface BalancesParams {
  balances: Balance[];
  currentCurrency: Currency;
  currencies: Currency[];
}

export async function renderBalancesPage(params: BalancesParams): Promise<string> {
  const balancesPug = await Bun.file(TEMPLATES_DIR + "/balances.pug").text();

  const adjustedBalances = params.balances.map(b => ({ ...b, balance: b.balance * params.currentCurrency.rate }))

  const balancesHtml = pug.compile(balancesPug)({
    balances: adjustedBalances,
    currentCurrency: params.currentCurrency,
  });

  return renderLayout(balancesHtml, params.currencies);
}

