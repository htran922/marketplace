const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const {
  AUTH0_DOMAIN_URL,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_CALLBACK_URL,
} = require("./constants");

passport.use(
  new Auth0Strategy(
    {
      domain: AUTH0_DOMAIN_URL,
      clientID: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      callbackURL:
        "http://localhost:8080/auth0/callback" || AUTH0_CALLBACK_URL,
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      const userInfo = {
        profile,
        extraParams,
      };
      return done(null, userInfo);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
