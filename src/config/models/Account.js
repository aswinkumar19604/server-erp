import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model("Account", accountSchema);
