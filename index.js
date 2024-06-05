import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import connectDB from "./config/db.js";
import { router as userRouter } from "./routes/userRouter.js";
import { router as linkRouter } from "./routes/linkRouter.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(fileUpload({ useTempFiles: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(express.json());

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/links", linkRouter);

app.listen(PORT, () => {
  console.log("server is running");
});
