import express from "express";
import { requireSignin } from "../common-middleware/user.js";
import { getOrder } from "../controller/order.js";
const router = express.Router();

router.get("/get-list-order", requireSignin, getOrder);

export default router;
