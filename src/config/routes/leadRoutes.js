import express from "express";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadSummary
} from "../controllers/leadController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", getLeadSummary);
router.get("/", getLeads);
router.post("/", createLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
