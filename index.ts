import { createDebtAccount, getUserAccount, getUserAccounts, getUsers } from "./lib/api-operations";
import { extractSharedTransactionEmails, getDebtAccountName, registerUser } from "./lib/domain";
import type { WebhookPayload } from "./lib/entities";
import { getLocalUsers } from "./lib/storage";


const server = Bun.serve({
  routes: {
    "/transaction_webhook": {
      POST: async req => {
        let errors: string[] = []

        try {
          const body = (await req.json()) as WebhookPayload;

          for (let transaction of body.content.transactions) {

            const payeeEmails = extractSharedTransactionEmails(transaction);

            // the new transaction is not a shared transaction
            if (payeeEmails.length === 0) {

              continue;

            }

            const localUsers = getLocalUsers();

            if (!localUsers[0]) {
              throw new Error("No users registered");
            }

            const fireflyUsers = await getUsers(localUsers[0].token);

            const payer = fireflyUsers.find(u => u.id.toString() === transaction.user.toString());

            if (!payer) {
              throw new Error(`Payer with ID ${payer} been found in Firefly`);
            }

            const payerToken = localUsers.find(u => u.email === payer.attributes.email)?.token;


            if (!payerToken) {
              throw new Error(`Payer ${payer.attributes.email} has not registered their token`);
            }

            const payerAccounts = await getUserAccounts(payerToken)


            for (let m of payeeEmails) {

              const payerDebtAccount = payerAccounts.find(a => a.attributes.name === getDebtAccountName(m));

              console.log(payerAccounts.map(a => a.attributes.name), m)


              // If the payer has no debtAccount, create one 
              if (!payerDebtAccount) {
                try {
                  await createDebtAccount(getDebtAccountName(m), payerToken);
                } catch (error) {
                  errors.push(`Error creating debt account "${getDebtAccountName(m)}" for payer ${payer.attributes.email}: ${error}`);
                  break;
                }
              }

              const payeeToken = localUsers.find(u => u.email === m)?.token

              if (!payeeToken) {
                errors.push(`Transaction could not be processed: payee ${m} has not registered their token`);
                continue;
              }

              const payeeAccounts = await getUserAccounts(payeeToken);

              const debtAccount = payeeAccounts.find(a => a.attributes.name === getDebtAccountName(payer.attributes.email));

              // If the payee has no debtAccount, create one 
              if (!debtAccount) {
                try {
                  const debtAccount = await createDebtAccount(getDebtAccountName(payer.attributes.email), payeeToken);
                } catch (error) {
                  errors.push(`Error creating debt account for ${m}: ${error}`);
                  continue;
                }
              }


              //all acounts are there, now the transaction
            }
            if (errors.length > 0)
              continue
          }

          if (errors.length > 0)
            return new Response(JSON.stringify({ errors: errors }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });

          return new Response("OK");
        } catch (error) {
          console.error(error);
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });

        }
      },
    },
    "/user/register": {
      POST: async (req) => {
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
  },

  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at ${server.url}`);
