import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "colors";
import cookieParser from "cookie-parser";

import globalErrorHandler from "./controllers/error.controller.js";
import AppError from "./utils/appError.js";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

connectDB();

app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World! HEheehehiehwi");
});

app.use("/api/v1/auth", authRoutes);

app.use(globalErrorHandler);

app.listen(process.env.PORT || 3010, () => {
  console.log("Server is running on port 3010, hehe");
});
