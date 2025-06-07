import express from "express";
import { getAllUsers, getUserProfile } from "../controllers/auth.controller.js";


const userRoutes = express.Router();

userRoutes.route("/").get(getAllUsers);
userRoutes.route("/:username").get(getUserProfile);

export default userRoutes;
