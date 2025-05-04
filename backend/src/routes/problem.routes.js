import express from "express";


import { authMiddleware, checkAdmin } from "../middleware/auth.middlware.js";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemByID,
  getProblemSolvedByUser,
  updateProblem,
} from "../controllers/problem.controllers.js";

const problemRoutes = express.Router();

problemRoutes.post(
  "/create-problem",
  authMiddleware,
  checkAdmin,
  createProblem
);

problemRoutes.get(
  "/get-all-problems",
  authMiddleware,
  checkAdmin,
  getAllProblems
);

problemRoutes.get("/get-problem/:id", authMiddleware, getProblemByID);

problemRoutes.get(
  "/get-solved-problems",
  authMiddleware,
  getProblemSolvedByUser
);

problemRoutes.put("/update-problem", authMiddleware, checkAdmin, updateProblem);

problemRoutes.delete(
  "delete-problem",
  authMiddleware,
  checkAdmin,
  deleteProblem
);
export default problemRoutes;
