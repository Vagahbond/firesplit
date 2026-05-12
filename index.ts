import { authenticateUser, AuthTokenName } from "./lib/authService";
import { FireSplitError } from "./lib/errors";
import { renderBalancesPage } from "./lib/render/balances";
import { rootUrl, TEMPLATES_DIR } from "./lib/render/const";
import { renderErrorPage } from "./lib/render/error";
import { renderReportPage } from "./lib/render/reports";
import { getBalancesForUser, getCurrencies, getDebtsForUser, getReimbursementsForUser } from "./lib/repository/repository";

const port = process.env.PORT ?? 3000;

function mkWebResponse(body: string, status: number = 500) {
  return new Response(body, { status: status, headers: { "Content-Type": "text/html" } });
}


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

    "/": async (req) => {
      const token = req.cookies.get(AuthTokenName)

      if (!token) {
        const errorPage = await renderErrorPage(new FireSplitError("Token not found", 401));

        return mkWebResponse(errorPage, 401);
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


      const cur = req.cookies.get("currency") ?? "EUR";

      const ffCurrencies = await getCurrencies(user.id);


      const currentCurrency = ffCurrencies.find(c => c.to_currency_code.toLowerCase() === cur.toLowerCase());

      if (!currentCurrency) {
        const errorPage = await renderErrorPage(new FireSplitError("Currency not found", 401));
        return mkWebResponse(errorPage, 401);
      }


      const balances = await getBalancesForUser(currentCurrency, user)

      const balancesPage = await renderBalancesPage({ balances, currentCurrency, currencies: ffCurrencies });

      return mkWebResponse(balancesPage, 200);

    },

    "/set-currency/:code": async (req) => {
      const code = req.params.code

      if (!code) {
        const errorPage = await renderErrorPage(new FireSplitError("Currency code not found", 401));
        return mkWebResponse(errorPage, 401);
      }

      // Set currency cookie and redirect to / 

      return new Response("OK", { status: 302, headers: { "Location": rootUrl + "/", "Set-Cookie": `currency=${code}; Path=/` } });

    },

    "/report/:email": async (req) => {
      const email = req.params.email

      if (!email) {
        const errorPage = await renderErrorPage(new FireSplitError("Email not found", 401));
        return mkWebResponse(errorPage, 401);
      }

      const token = req.cookies.get(AuthTokenName)

      if (!token) {
        const errorPage = await renderErrorPage(new FireSplitError("Token not found", 401));
        return mkWebResponse(errorPage, 401);
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

      const cur = req.cookies.get("currency") ?? "ERR";

      const ffCurrencies = await getCurrencies(user.id);

      const currentCurrency = ffCurrencies.find(c => c.to_currency_code === cur);

      if (!currentCurrency) {
        const errorPage = await renderErrorPage(new FireSplitError("Currency not found", 401));
        return mkWebResponse(errorPage, 401);
      }

      const debts = await getDebtsForUser(user, email)

      const reimbursements = await getReimbursementsForUser(user, email)

      const currentBalances = await getBalancesForUser(currentCurrency, user)

      const currentBalance = currentBalances.find(b => b.email === email)?.balance ?? 0



      const reportPage = await renderReportPage({ email, debts, reimbursements, currentBalance, currentCurrency, currencies: ffCurrencies });
      return mkWebResponse(reportPage, 200);

    },

  },
});
