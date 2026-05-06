import { authenticateUser, AuthTokenName } from "./lib/authService";
import { FireSplitError } from "./lib/errors";
import { renderBalancesPage, renderErrorPage, renderReportPage } from "./lib/render";
import { getBalancesForUser, getDebtsForUser, getReimbursementsForUser } from "./lib/repository/repository";

function mkWebResponse(body: string, status: number = 500) {
  return new Response(body, { status: status, headers: { "Content-Type": "text/html" } });
}

Bun.serve({
  port: 3000,
  routes: {
    "/report/:email": async (req) => {
      const email = req.params.email

      if (!email) {
        const errorPage = await renderErrorPage(new FireSplitError("Email not found", 401));
        return mkWebResponse(errorPage, 401);
      }

      const user = await authenticateUser(email).catch(async e => {
        console.error(e);

        const errorPage = await renderErrorPage(e);

        return mkWebResponse(errorPage, e.status);

      });

      if (!user || user instanceof Response) {
        const errorPage = await renderErrorPage(new FireSplitError("User not found", 401));

        return mkWebResponse(errorPage, 401);
      }

      const debts = await getDebtsForUser(user.email)

      const reimbursements = await getReimbursementsForUser(user.email)



      const reportPage = await renderReportPage(debts, reimbursements);
      return mkWebResponse(reportPage, 200);

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
    "/": async (req) => {
      const token = req.cookies.get(AuthTokenName)

      if (!token) {
        return new Response("No token found", { status: 401 });
      }

      const user = await authenticateUser(token).catch(async e => {
        console.error(e);

        const errorPage = await renderErrorPage(e);

        return mkWebResponse(errorPage, e.status);

      });

      if (!user || user instanceof Response) {
        const errorPage = await renderErrorPage(new FireSplitError("User not found", 401));

        return mkWebResponse(errorPage, 401);
      }

      const balances = await getBalancesForUser(user.email)

      const balancesPage = await renderBalancesPage(balances);

      return mkWebResponse(balancesPage, 200);

    },
  },
});
