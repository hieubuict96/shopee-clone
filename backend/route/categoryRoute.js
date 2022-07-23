import express from "express";
import { upload } from "../common-middleware/category.js";
const router = express.Router();
import { getCategory, createCategory } from "../controller/categoryController.js";
import { requireSignin } from '../common-middleware/user.js';

router.post("/create-category", upload.single("imgCategory"), createCategory);
router.get("/get-category", requireSignin, getCategory);

export default router;
