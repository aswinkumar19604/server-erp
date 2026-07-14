import express from "express";
import { getMonthlyReport } from "../controllers/dashboardController.js";
import {
  getDashboard
}
from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/",
  getDashboard
);
router.get("/charts", getMonthlyReport); 
export default router;