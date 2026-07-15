import express from "express";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadSummary
} from "../controllers/leadController.js";

const router = express.Router();

router.get("/summary", getLeadSummary);
router.get("/", getLeads);
router.post("/", createLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
