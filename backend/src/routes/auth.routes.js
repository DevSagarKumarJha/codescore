import express from "express";
import { check, getMe, login, logout, register } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.route("/register").post(register);
authRoutes.route("/login").post(login);
authRoutes.route("/logout").post(logout);
authRoutes.route("/me").get(getMe);
authRoutes.route("/check").get(check);

export default authRoutes;
