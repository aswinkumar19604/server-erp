import express from "express";
import {
  getAccounts,
  getJournalEntries,
  createJournalEntry,
  getFinancialReports
} from "../controllers/doubleEntryController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/accounts", getAccounts);
router.get("/journal-entries", getJournalEntries);
router.post("/journal-entries", createJournalEntry);
router.get("/reports", getFinancialReports);

export default router;
