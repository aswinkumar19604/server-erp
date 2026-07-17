import AuditLog from "../models/AuditLog.js";

/**
 * Helper utility to log database transactions and admin changes
 * @param {Object} req - The express request object containing user context
 * @param {String} action - The action type: 'CREATE', 'UPDATE', 'DELETE'
 * @param {String} module - The ERP module: 'Sales', 'Purchases', 'Inventory', 'Accounting', 'HR', 'MRP'
 * @param {String} documentId - The target MongoDB document ID string
 * @param {String} details - Human-readable summary description of change
 * @param {Object} [changes] - Diff object showing changed fields before/after (optional)
 */
export const logAudit = async (req, action, module, documentId, details, changes = null) => {
  try {
    // If request has no authenticated user, skip logging to prevent crashes in public test files
    if (!req || !req.user || !req.user._id) {
      return;
    }

    const auditEntry = new AuditLog({
      operator: req.user._id,
      action,
      module,
      documentId: String(documentId),
      details,
      changes
    });

    await auditEntry.save();
  } catch (error) {
    // Catch logging errors silently to ensure core business functions are never blocked
    console.error("Audit log saving failed:", error);
  }
};
