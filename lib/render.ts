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

interface ReportEntity {
  date: Date;
  amount: number;
  originalAmount: number;
  payerEmail: string;
  description?: string;
  type: "debt" | "reimbursement";
}

export async function renderReportPage(email: string, debts: Debt[], reimbursements: Reimbursement[], currentBalance: number): Promise<string> {
  const reportPug = await Bun.file(TEMPLATES_DIR + "/report.pug").text();

  const debtEntities: ReportEntity[] = debts.map(d => ({
    date: new Date(d.date),
    amount: d.amount,
    description: d.description,
    originalAmount: d.original_amount,
    payerEmail: d.payer_email,
    type: "debt",
  }));

  const reimbursementEntities: ReportEntity[] = reimbursements.map(r => ({
    date: new Date(r.date),
    amount: r.amount,
    originalAmount: r.original_amount,
    description: r.description,
    payerEmail: r.payer_email,
    type: "reimbursement",
  }));

  const reportItems: ReportEntity[] = [...debtEntities, ...reimbursementEntities].sort((a, b) => b.date.getTime() - a.date.getTime());


  const reportHtml = pug.compile(reportPug)({
    email,
    items: reportItems,
    currentBalance,
  });


  return renderLayout(reportHtml);
}
