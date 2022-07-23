import express from "express";
const router = express.Router();
import { requireSignin } from "../common-middleware/user.js";
import { addToCart, getCart, reduceQtt, increaseQtt, deleteProduct, addToOrder } from "../controller/cart.js";

router.post("/add-to-cart", requireSignin, addToCart);
router.get("/get-cart", requireSignin, getCart);
router.put("/reduce-qtt", requireSignin, reduceQtt);
router.put("/increase-qtt", requireSignin, increaseQtt);
router.delete("/delete-product", requireSignin, deleteProduct);
router.put("/add-to-order", requireSignin, addToOrder);

export default router;
