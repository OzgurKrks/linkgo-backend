import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  setLink,
  getLinks,
  updateOrder,
  updateLinks,
  deleteLink,
  addThumbnail,
} from "../controllers/linkController.js";

const router = express.Router();

router.get("/getlinks", protect, getLinks);
router.post("/setlink", protect, setLink);
router.put("/updateorder", protect, updateOrder);
router.put("/:link_id", protect, updateLinks);
router.put("/addThumbnail/:link_id", protect, addThumbnail);
router.delete("/:link_id", protect, deleteLink);

export { router };
