import mongoose from "mongoose";

const accountingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["invoice", "expense", "payment"],
      required: true
    },
    reference: {
      type: String,
      trim: true,
      default: ""
    },
    party: {
      type: String,
      trim: true,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending"
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Accounting", accountingSchema);
