import express from "express";
import {
  createQuotation,
  getQuotations,
  updateQuotationStatus,
  createSalesOrder,
  getSalesOrders,
  updateSalesOrderStatus,
  convertQuoteToSO,
  convertSOToInvoice
} from "../controllers/salesWorkflowController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to all sales workflow endpoints
router.use(authMiddleware);

router.post("/quotations", createQuotation);
router.get("/quotations", getQuotations);
router.put("/quotations/:id/status", updateQuotationStatus);
router.post("/quotations/:id/convert-so", convertQuoteToSO);

router.post("/sales-orders", createSalesOrder);
router.get("/sales-orders", getSalesOrders);
router.put("/sales-orders/:id/status", updateSalesOrderStatus);
router.post("/sales-orders/:id/convert-invoice", convertSOToInvoice);

export default router;
