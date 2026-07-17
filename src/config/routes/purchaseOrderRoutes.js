import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

router.post("/", createPurchaseOrder);
router.get("/", getPurchaseOrders);
router.put("/:id", updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

export default router;
