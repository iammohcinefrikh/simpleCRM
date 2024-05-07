import express from "express";
const router = express.Router();
import { addProduct, getProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

router.post("/api/v1/product/add", addProduct);
router.get("/api/v1/product/get/:productId?", getProduct);
router.put("/api/v1/product/update/:productId?", updateProduct);
router.delete("/api/v1/product/delete/:productId?", deleteProduct);

export default router;