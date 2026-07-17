import express from "express";
import AuditLog from "../models/AuditLog.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authMiddleware globally to all audit log endpoints
router.use(authMiddleware);

// Fetch all audit logs, admin only
router.get("/audit-logs", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const logs = await AuditLog.find()
      .populate("operator", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
