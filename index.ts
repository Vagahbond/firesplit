import type { WebhookPayload } from "./lib/api/entities.ts";
import { createPeerTransactions, prepareTransaction, registerUser } from "./lib/domain/domain.ts";
import { FiresplitError } from "./lib/errors.ts";

export const routes = {
  "/transaction_webhook": {
    POST: async (req: Request) => {
      try {

        const body = (await req.json()) as WebhookPayload;

        for (let t of body.content.transactions) {

          const preparedTransaction = await prepareTransaction(t);

          if (preparedTransaction)
            createPeerTransactions(preparedTransaction);
        }

      } catch (e: unknown) {
        const error = e as Error;
        console.error(error)


        switch (error.constructor) {
          case FiresplitError:
            return new Response(error.message, { status: (error as FiresplitError).status, headers: { "Content-Type": "application/json" } });
          default:
            return new Response(JSON.stringify({ error: (error as Error).message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
        }
      }

      finally {
        return new Response("OK");
      }
    }
  },
  "/user/register": {
    POST: async (req: Request) => {
      try {


        const body = (await req.json()) as { token?: string; email?: string };

        if (!body.token || !body.email) {
          return new Response(JSON.stringify({ error: "Missing token or email" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        registerUser(body.token, body.email);

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  },
};

export function notFoundHandler(req: Request) {
  return new Response("Not Found", { status: 404 });
}

const server = Bun.serve({
  routes,

  fetch(req) {
    return notFoundHandler(req);
  },
});

console.log(`Server running at ${server.url}`);
