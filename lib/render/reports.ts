import type { Currency, Debt, Reimbursement } from "../repository/entities";
import { TEMPLATES_DIR } from "./const";
import pug from "pug";
import { renderLayout } from "./layout";

export interface ReportParams {
  email: string;
  reimbursements: Reimbursement[];
  debts: Debt[];
  currentBalance: number;
  currentCurrency: Currency;
  currencies: Currency[];
}

interface ReportEntity {
  date: Date;
  amount: number;
  originalAmount: number;
  normalizedAmount: number;
  payerEmail: string;
  description?: string;
  type: "debt" | "reimbursement";
  currencySymbol: string;
}

export async function renderReportPage(params: ReportParams): Promise<string> {
  const reportPug = await Bun.file(TEMPLATES_DIR + "/report.pug").text();

  const debtEntities: ReportEntity[] = params.debts.map(d => ({
    date: new Date(d.date),
    amount: d.amount,
    description: d.description,
    originalAmount: d.original_amount,
    payerEmail: d.payer_email,
    type: "debt",
    currencySymbol: d.currency_symbol,
    normalizedAmount: d.normalized_amount,
  }));

  const reimbursementEntities: ReportEntity[] = params.reimbursements.map(r => ({
    date: new Date(r.date),
    amount: r.amount,
    originalAmount: r.original_amount,
    description: r.description,
    payerEmail: r.payer_email,
    type: "reimbursement",
    currencySymbol: r.currency_symbol,
    normalizedAmount: r.normalized_amount,
  }));

  const reportItems: ReportEntity[] = [...debtEntities, ...reimbursementEntities].sort((a, b) => b.date.getTime() - a.date.getTime());

  const adjustedBalance = params.currentBalance * params.currentCurrency.rate

  const reportHtml = pug.compile(reportPug)({
    email: params.email,
    items: reportItems,
    currentBalance: adjustedBalance,
    currentCurrency: params.currentCurrency,
  });


  return renderLayout(reportHtml, params.currencies);
}
