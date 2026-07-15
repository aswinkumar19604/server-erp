import express from "express";
import {
  createAccountingEntry,
  deleteAccountingEntry,
  getAccountingEntries,
  getAccountingSummary,
  updateAccountingEntry
} from "../controllers/accountingController.js";

const router = express.Router();

router.get("/summary", getAccountingSummary);
router.get("/", getAccountingEntries);
router.post("/", createAccountingEntry);
router.put("/:id", updateAccountingEntry);
router.delete("/:id", deleteAccountingEntry);

export default router;
