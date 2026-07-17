import express from "express";
import {
  createBOM,
  getBOMs,
  createWorkOrder,
  getWorkOrders,
  updateWorkOrderStatus
} from "../controllers/mrpController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to all manufacturing endpoints
router.use(authMiddleware);

router.post("/bom", createBOM);
router.get("/bom", getBOMs);
router.post("/work-order", createWorkOrder);
router.get("/work-order", getWorkOrders);
router.put("/work-order/:id/status", updateWorkOrderStatus);

export default router;
