import express from "express";
const router = express.Router();
import { addEnterprise, getEnterprise, updateEnterprise, deleteEnterprise } from "../controllers/enterpriseController.js";

router.post("/api/v1/enterprise/add", addEnterprise);
router.get("/api/v1/enterprise/get/:enterpriseId?", getEnterprise);
router.put("/api/v1/enterprise/update/:enterpriseId?", updateEnterprise);
router.delete("/api/v1/enterprise/delete/:enterpriseId?", deleteEnterprise);

export default router;