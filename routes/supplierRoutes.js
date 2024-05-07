import express from "express";
const router = express.Router();
import { addSupplier, getSupplier, updateSupplier, deleteSupplier } from "../controllers/supplierController.js";

router.post("/api/v1/supplier/add", addSupplier);
router.get("/api/v1/supplier/get/:supplierId?", getSupplier);
router.put("/api/v1/supplier/update/:supplierId?", updateSupplier);
router.delete("/api/v1/supplier/delete/:supplierId?", deleteSupplier);

export default router;