const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { AUTH0_DOMAIN_URL } = require("../constants")

module.exports = {
  checkJwt: {
    invalidToken: [
      jwt({
        secret: jwksRsa.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${AUTH0_DOMAIN_URL}/.well-known/jwks.json`,
        }),
        // Validate audience and issuer
        issuer: `https://${AUTH0_DOMAIN_URL}/`,
        algorithms: ["RS256"],
      }),
      (err, req, res, next) => {
        if (err.name === "UnauthorizedError") {
          res.status(401).json({ Error: "Invalid JWT" });
        }
      },
    ]
  }
  
};
