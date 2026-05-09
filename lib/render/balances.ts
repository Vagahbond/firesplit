import type { Balance, Currency } from "../repository/entities";
import pug from "pug";
import { TEMPLATES_DIR } from "./const";
import { renderLayout } from "./layout";

export interface BalancesParams {
  balances: Balance[];
  currencySymbol: string;
  currencies: Currency[];
}

export async function renderBalancesPage(params: BalancesParams): Promise<string> {
  const balancesPug = await Bun.file(TEMPLATES_DIR + "/balances.pug").text();

  const balancesHtml = pug.compile(balancesPug)({
    balances: params.balances,
    currencySymbol: params.currencySymbol,
  });

  return renderLayout(balancesHtml, params.currencies);
}

