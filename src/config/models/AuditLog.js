import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE"],
    required: true
  },
  module: {
    type: String,
    enum: ["Sales", "Purchases", "Inventory", "Accounting", "HR", "MRP"],
    required: true
  },
  documentId: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

export default mongoose.model("AuditLog", auditLogSchema);
