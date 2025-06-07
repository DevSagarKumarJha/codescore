import express from "express";
import { authMiddleware } from "../middleware/auth.middlware.js";
import {submitCode, runCode} from "../controllers/executeCode.controller.js";

const executionRoutes = express.Router();

executionRoutes.post("/submit", authMiddleware, submitCode);
executionRoutes.post("/run", authMiddleware, runCode);

export default executionRoutes;