import type { Currency } from "../repository/entities";
import { TEMPLATES_DIR } from "./const";
import pug from "pug";

export async function renderLayout(content: string, currencies?: Currency[]): Promise<string> {

  const indexPug = await Bun.file(TEMPLATES_DIR + "/index.pug").text();

  const finalHtml = pug.compile(indexPug)({
    content: content,
    currencies: currencies,
  });

  return finalHtml;
}
