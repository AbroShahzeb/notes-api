import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  googleCallback,
  login,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";

import { authorize } from "../middlewares/authorize.middleware.js";
import passport from "passport";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", authorize, getCurrentUser);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback
);

export default router;
