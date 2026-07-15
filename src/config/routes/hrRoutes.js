import express from "express";
import {
  getHRDashboard,
  getAttendances,
  createAttendance,
  getLeaves,
  createLeave,
  updateLeave,
  getPayrolls,
  createPayroll
} from "../controllers/hrController.js";

const router = express.Router();

router.get("/dashboard", getHRDashboard);
router.get("/attendance", getAttendances);
router.post("/attendance", createAttendance);
router.get("/leave", getLeaves);
router.post("/leave", createLeave);
router.put("/leave/:id", updateLeave);
router.get("/payroll", getPayrolls);
router.post("/payroll", createPayroll);

export default router;
