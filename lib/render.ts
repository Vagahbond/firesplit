import pug from "pug";
import type { FireSplitError } from "./errors";
import type { Balance } from "./repository/entities";

async function renderLayout(content: string): Promise<string> {

  const indexPug = await Bun.file("templates/index.pug").text();


  const finalHtml = pug.compile(indexPug)({
    content: content,
  });

  return finalHtml;
}

export async function renderErrorPage(error: FireSplitError): Promise<string> {
  const errorPug = await Bun.file("templates/error.pug").text();

  const errorHtml = pug.compile(errorPug)({
    type: "error",
    status: error.status,
    message: error.message,
  });


  return renderLayout(errorHtml);
}

export async function renderBalancesPage(balances: Balance[]): Promise<string> {
  const balancesPug = await Bun.file("templates/balances.pug").text();

  const balancesHtml = pug.compile(balancesPug)({
    balances: balances,
  });

  return renderLayout(balancesHtml);
}
