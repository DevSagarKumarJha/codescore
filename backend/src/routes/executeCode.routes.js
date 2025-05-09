import express from "express";
import { authMiddleware } from "../middleware/auth.middlware.js";
import executeCode from "../controllers/executeCode.controller.js";

const executionRoutes = express.Router();

executionRoutes.post("/", authMiddleware, executeCode);

export default executionRoutes;