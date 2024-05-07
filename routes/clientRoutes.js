import express from "express";
import { addClient, getClient, updateClient, deleteClient } from "../controllers/clientController.js";

const router = express.Router();

router.post("/api/v1/client/add", addClient);
router.get("/api/v1/client/get/:clientId?", getClient);
router.put("/api/v1/client/update/:clientId?", updateClient);
router.delete("/api/v1/client/delete/:clientId?", deleteClient);

export default router;