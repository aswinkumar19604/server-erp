import express from "express";

import {
  exportSalesReport
} from "../controllers/reportController.js";

const router = express.Router();

router.get(
   "/sales/export/excel",
  exportSalesReport
);

export default router;