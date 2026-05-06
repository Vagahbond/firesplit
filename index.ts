import { authenticateUser, AuthTokenName } from "./lib/authService";
import { FireSplitError } from "./lib/errors";
import { renderBalancesPage, renderErrorPage } from "./lib/render";
import { getBalancesForUser, getDebtsForUser, getReimbursementsForUser } from "./lib/repository/repository";

Bun.serve({
  port: 3000,
  routes: {
    "/": async (req) => {
      const token = req.cookies.get(AuthTokenName)

      if (!token) {
        return new Response("No token found", { status: 401 });
      }

      const user = await authenticateUser(token).catch(async e => {
        console.error(e);

        switch (e.name) {
          case "FiresplitError":
            return new Response(await renderErrorPage(e), { status: e.status });
          default:
            return new Response(await renderErrorPage(e), { status: 500 });
        }
      });

      if (!user || user instanceof Response) {
        return new Response("User not found", { status: 401 });
      }

      const balances = await getBalancesForUser(user.email)



      return new Response(await renderBalancesPage(balances), { headers: { "Content-Type": "text/html" } });
    },

    "/style.css": () => {
      return new Response(Bun.file(import.meta.dir + "/templates/style.css"), {
        headers: { "Content-Type": "text/css" }
      });
    },

    "/robots.txt": () => {
      return new Response(Bun.file(import.meta.dir + "/templates/robots.txt"), {
        headers: { "Content-Type": "text/plain" }
      });
    },
  },
});
