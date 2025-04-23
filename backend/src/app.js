import express from "express";
import cookieParser from "cookie-parser"


import authRoutes from "./routes/auth.routes.js";


const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello, It is a leetlab practice server");
})

app.use("/api/v1/auth", authRoutes);

export default app;