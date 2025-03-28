import express, { Request, Response, NextFunction } from "express";
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
  })
);

// Local authentication routes
router.post("/register", controller.register);
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(req.cookies)
      return res.json({ user });
    });
  })(req, res, next);
});

export default router;
