import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "colors";
import globalErrorHandler from "./controllers/error.controller.js";
import AppError from "./utils/appError.js";
import { connectDB } from "./utils/db.js";

const app = express();

connectDB();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World! HEheehehiehwi");
});

app.get("/error", (req, res, next) => {
  return next(new AppError("An annoying error occurred", 400));
});

app.use(globalErrorHandler);

app.listen(process.env.PORT || 3010, () => {
  console.log("Server is running on port 3010, hehe");
});
