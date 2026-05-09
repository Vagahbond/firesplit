import type { FireSplitError } from "../errors";
import pug from "pug";
import { TEMPLATES_DIR } from "./const";
import { renderLayout } from "./layout";

export async function renderErrorPage(error: FireSplitError): Promise<string> {
  const errorPug = await Bun.file(TEMPLATES_DIR + "/error.pug").text();

  const errorHtml = pug.compile(errorPug)({
    type: "error",
    status: error.status,
    message: error.message,
  });


  return renderLayout(errorHtml);
}
