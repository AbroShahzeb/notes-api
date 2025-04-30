import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World! HEheehehiehwi");
});

app.listen(process.env.PORT || 3010, () => {
  console.log("Server is running on port 3010, hehe");
});
