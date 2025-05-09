import express from "express";
import {
  check,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middlware.js";

const authRoutes = express.Router();

authRoutes.route("/register").post(register);
authRoutes.route("/login").post(login);
authRoutes.route("/logout").post(authMiddleware, logout);
// authRoutes.route("/me").get(getMe);
authRoutes.route("/check").get(authMiddleware, check);

export default authRoutes;
