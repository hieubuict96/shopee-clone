import express from "express";
import { requireSignin } from "../common-middleware/user.js";
import { upload, validateProduct } from "../common-middleware/product.js";
import {
  getFlashSale,
  getAllProductsSeller,
  addProduct,
  getProduct,
  getAllProductsCustomer
} from "../controller/productController.js";
const router = express.Router();

router.get("/flash-sale", requireSignin, getFlashSale);
router.get("/seller/get-all", requireSignin, getAllProductsSeller);
router.post(
  "/seller/add-product",
  requireSignin,
  upload.array("productImages", 12),
  validateProduct,
  addProduct
);
router.get("/get-all-products-customer", requireSignin, getAllProductsCustomer);
router.get("/:id", getProduct);

export default router;
