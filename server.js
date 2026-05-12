const express = require("express");
const session = require("express-session");
const passport = require("passport");
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

app.use(session({
  secret: "ci-cd-secret-key",
  resave: false,
  saveUninitialized: true
}));

// Passport Middleware (IMPORTANT - MUST BE HERE)
app.use(passport.initialize());
app.use(passport.session());

// Serialize / Deserialize
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Microsoft Strategy
passport.use(new OIDCStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  responseType: "code",
  responseMode: "query",
  redirectUrl: process.env.CALLBACK_URL,
  allowHttpForRedirectUrl: true,
  scope: ["profile", "email"]
},
(iss, sub, profile, accessToken, refreshToken, done) => {
  return done(null, profile);
}));

// Home Route
app.get("/", (req, res) => {
  res.send("CI/CD Project Running 🚀");
});

// REAL Login Route
app.get("/login",
  passport.authenticate("azuread-openidconnect")
);

// Callback Route
app.get("/auth/callback",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.send("Login Successful 🚀 Welcome " + req.user.displayName);
  }
);

// Server Start
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});