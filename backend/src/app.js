import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";


import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import executionRoutes from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import userRoutes from "./routes/user.routes.js";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.FRONTEND_URI ||
      "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.send("Hello, It is a leetlab practice server");
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);


app.use(errorHandler);

export default app;