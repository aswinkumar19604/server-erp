import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes
from "./routes/employeeRoutes.js";
import dashboardRoutes
from "./routes/dashboardRoutes.js";
import productRoutes
from "./routes/productRoutes.js";
import inventoryRoutes
from "./routes/inventoryRoutes.js";
import customerRoutes
from "./routes/customerRoutes.js";
import notificationRoutes
from "./routes/notificationRoutes.js";
import saleRoutes
from "./routes/saleRoutes.js";
import stockHistoryRoutes from "./routes/stockHistoryRoutes.js";
import purchaseRoutes
from "./routes/purchaseRoutes.js";
import invoiceRoutes
from "./routes/invoiceRoutes.js";
import supplierRoutes
from "./routes/supplierRoutes.js";
import reportRoutes
from "./routes/reportRoutes.js";
import accountingRoutes from "./routes/accountingRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import goodsReceiptRoutes from "./routes/goodsReceiptRoutes.js";
import doubleEntryRoutes from "./routes/doubleEntryRoutes.js";
import essRoutes from "./routes/essRoutes.js";
import mrpRoutes from "./routes/mrpRoutes.js";
import salesWorkflowRoutes from "./routes/salesWorkflowRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(
  "/api/employees",
  employeeRoutes
);
import aiRoutes from "./routes/aiRoutes.js";
app.use("/api/ai", aiRoutes);
app.use(
  "/api/dashboard",
  dashboardRoutes
);      
app.use(
  "/api/products",
  productRoutes
);  
app.use(
  "/api/inventory",
  inventoryRoutes
);
app.use(
  "/api/sales",
  saleRoutes
);
app.use(
  "/api/purchases",
  purchaseRoutes
);
app.use(
  "/api/invoice",
  invoiceRoutes
);      
app.use(
  "/api/customers",
  customerRoutes
);
app.use(
  "/api/suppliers",
  supplierRoutes
);
app.use(
  "/api/stock-history",
  stockHistoryRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);
app.use(
  "/api",
  reportRoutes
);
app.use("/api/accounting", accountingRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/double-entry", doubleEntryRoutes);
app.use("/api/ess", essRoutes);
app.use("/api/mrp", mrpRoutes);
app.use("/api/sales-workflow", salesWorkflowRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/chat", chatRoutes);
export default app;