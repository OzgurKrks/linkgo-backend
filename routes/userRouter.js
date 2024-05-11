import express from "express";
const router = express.Router();
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/userController.js";

router.post("/login", loginUser);
router.post("/", registerUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);

export { router };
