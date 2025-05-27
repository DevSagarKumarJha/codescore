import express from "express";
import {
  check,
  getUserProfile,
  login,
  logout,
  register,
  resendVerificationMail,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middlware.js";

const authRoutes = express.Router();

authRoutes.route("/register").post(register);
authRoutes.route("/verify/:token").post(verifyEmail);
authRoutes.route("/resend-verification-mail").post(authMiddleware, resendVerificationMail);
authRoutes.route("/login").post(login);
authRoutes.route("/logout").post(authMiddleware, logout);
// authRoutes.route("/me").get(getMe);
authRoutes.route("/check").get(authMiddleware, check);
authRoutes.route("/profile").get(authMiddleware, getUserProfile);

export default authRoutes;
