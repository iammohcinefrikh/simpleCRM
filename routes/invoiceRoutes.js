import express from "express";
const router = express.Router();
import { addInvoice, getInvoice, updateInvoice, deleteInvoice } from "../controllers/invoiceController.js";

router.post("/api/v1/invoice/add", addInvoice);
router.get("/api/v1/invoice/get/:invoiceId?", getInvoice);
router.put("/api/v1/invoice/update/:invoiceId?", updateInvoice);
router.delete("/api/v1/invoice/delete/:invoiceId?", deleteInvoice);

export default router;