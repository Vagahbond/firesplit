import { homePage, mkWebResponse, reportPage } from "./lib/controller";
import { ErrorMiddleware } from "./lib/errorMiddleware";
import { FireSplitError } from "./lib/errors";
import { rootUrl, TEMPLATES_DIR } from "./lib/render/const";
import { renderErrorPage } from "./lib/render/error";

const port = process.env.PORT ?? 3000;


Bun.serve({
  port: port,
  routes: {

    "/style.css": () => {
      return new Response(Bun.file(TEMPLATES_DIR + "/style.css"), {
        headers: { "Content-Type": "text/css" }
      });
    },

    "/assets/:file": req => {
      const filename = req.params.file;
      const file = Bun.file(TEMPLATES_DIR + `/assets/${filename}`)
      const mimetype = file.type;

      return new Response(file, {
        headers: {
          "Content-Type": mimetype,
        },
      });
    },

    "/robots.txt": () => {
      return new Response(Bun.file(TEMPLATES_DIR + "/robots.txt"), {
        headers: { "Content-Type": "text/plain" }
      });
    },

    "/": ErrorMiddleware(homePage),

    "/report/:email": ErrorMiddleware(reportPage),

    "/set-currency/:code": async (req) => {
      const code = req.params.code

      if (!code) {
        const errorPage = await renderErrorPage(new FireSplitError("Currency code not found", 401));
        return mkWebResponse(errorPage, 401);
      }

      // Set currency cookie and redirect to / 

      return new Response("OK", { status: 302, headers: { "Location": rootUrl + "/", "Set-Cookie": `currency=${code}; Path=/` } });

    },
  },
});
