import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "colors";
import cookieParser from "cookie-parser";
import passport from "passport";

import globalErrorHandler from "./controllers/error.controller.js";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import "./utils/passport.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CORS_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World! HEheehehiehwi");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", notesRoutes);

app.use(globalErrorHandler);

app.listen(process.env.PORT || 3010, () => {
  console.log("Server is running on port 3010, hehe");
});
