import type { BunRequest } from "bun";
import { FireSplitError } from "./errors";
import { renderErrorPage } from "./render/error";
import { mkWebResponse } from "./controller";

export function ErrorMiddleware(next: (req: BunRequest) => Promise<Response>): Handler<BunRequest> {

  return async (req: BunRequest) => {
    try {
      return await next(req);
    } catch (e) {
      console.error(e);

      if (e instanceof FireSplitError) {
        const errorPage = await renderErrorPage(e);
        return mkWebResponse(errorPage, e.status);
      }

      const errorPage = await renderErrorPage(new FireSplitError("Unexpected error", 500));
      return mkWebResponse(errorPage, 500);
    }
  }
}
