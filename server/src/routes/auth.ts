import express from "express";
import passport from "passport";

const router = express.Router();

import * as controller from "../controllers/auth";

// GitHub OAuth routes
router.get("/login/success", controller.loginSuccess);
router.get("/login/failed", controller.loginFail);
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: process.env.CLIENT_URL,
  }),
  controller.githubCallback
);

// Local authentication routes
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/refresh-token", controller.refreshToken);

export default router;
