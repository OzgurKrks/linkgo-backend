import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  getMe,
  editProfile,
  updateUserPage,
  editAccount,
  getSinglePage,
  deleteProfileImage,
} from "../controllers/userController.js";

router.post("/login", loginUser);
router.post("/", registerUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.put("/editUser", protect, editProfile);
router.get("/getMe", protect, getMe);
router.put("/updateUserPage", protect, updateUserPage);
router.put("/editAccount", protect, editAccount);
router.get("/getSinglePage/:username", getSinglePage);
router.delete("/deleteProfileImage", protect, deleteProfileImage);

export { router };
// http://localhost:5000/api/users/getMe
