// app.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { router as userRouter } from "./routes/userRouter.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json()); // JSON verilerini işlemek için body-parser kullanılıyor.

app.use("/api/users", userRouter); // userRouter'ı /api/users rotası altında kullan

app.listen(PORT, () => {
  console.log("server is running");
});
