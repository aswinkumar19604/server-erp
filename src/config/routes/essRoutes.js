import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getESSProfile,
  clockAttendance,
  getESSAttendance,
  requestESSLeave,
  getESSLeaves,
  getESSPayrolls,
  getESSTasks,
  updateESSTaskStatus
} from "../controllers/essController.js";

const router = express.Router();

// Apply authMiddleware globally to all employee self-service endpoints
router.use(authMiddleware);

router.get("/profile", getESSProfile);
router.post("/attendance/clock", clockAttendance);
router.get("/attendance", getESSAttendance);
router.post("/leave", requestESSLeave);
router.get("/leave", getESSLeaves);
router.get("/payroll", getESSPayrolls);
router.get("/tasks", getESSTasks);
router.put("/tasks/status", updateESSTaskStatus);

export default router;
