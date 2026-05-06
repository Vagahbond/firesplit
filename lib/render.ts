import pug from "pug";
import type { FireSplitError } from "./errors";
import type { Balance, Debt, Reimbursement } from "./repository/entities";

const TEMPLATES_DIR = import.meta.dir + "/../templates";

async function renderLayout(content: string): Promise<string> {

  const indexPug = await Bun.file(TEMPLATES_DIR + "/index.pug").text();


  const finalHtml = pug.compile(indexPug)({
    content: content,
  });

  return finalHtml;
}

export async function renderErrorPage(error: FireSplitError): Promise<string> {
  const errorPug = await Bun.file(TEMPLATES_DIR + "/error.pug").text();

  const errorHtml = pug.compile(errorPug)({
    type: "error",
    status: error.status,
    message: error.message,
  });


  return renderLayout(errorHtml);
}

export async function renderBalancesPage(balances: Balance[]): Promise<string> {
  const balancesPug = await Bun.file(TEMPLATES_DIR + "/balances.pug").text();

  const balancesHtml = pug.compile(balancesPug)({
    balances: balances,
  });

  return renderLayout(balancesHtml);
}

export async function renderReportPage(debts: Debt[], reimbursements: Reimbursement[]): Promise<string> {
  const reportPug = await Bun.file(TEMPLATES_DIR + "/report.pug").text();

  const reportHtml = pug.compile(reportPug)({
    debts: debts,
    reimbursements: reimbursements,
  });


  return renderLayout(reportHtml);
}
