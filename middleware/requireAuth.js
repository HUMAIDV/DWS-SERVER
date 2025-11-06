import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";


export const requireAuth = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://dev-bexgnp5o1w5c8glq.us.auth0.com/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  }),
//   audience: "YOUR_AUTH0_API_IDENTIFIER",
  audience: "1k2IAf5W87dJuqOuP0Bu6J88cfQL35FVXAbdl-zZzZrRegwKdvXxvQbwzdcPvWUm",
  issuer: `https://dev-bexgnp5o1w5c8glq.us.auth0.com/`,
  algorithms: ["RS256"],
});
