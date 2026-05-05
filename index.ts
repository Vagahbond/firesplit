import { authenticateUser, AuthTokenName } from "./lib/authService";
import { getDebtsForUser } from "./lib/repository/repository";



Bun.serve({
  port: 3000,
  routes: {
    "/": async (req) => {
      const token = req.cookies.get(AuthTokenName)

      if (!token) {
        return new Response("No token found", { status: 401 });
      }

      const user = await authenticateUser(token).catch(e => {
        console.error(e);

        switch (e.name) {
          case "MalformedTokenError":
            return new Response(`Malformed token: ${e.message}`, { status: 401 });
          case "CryptographicError":
            return new Response(`Cryptographic error ${e.message}`, { status: 401 });
          default:
            return new Response(`Unknown error ${e.message}`, { status: 500 });
        }
      });


      if (!user) {
        return new Response("User not found", { status: 401 });
      }








      return new Response("Hello !");
    },
  },
});
