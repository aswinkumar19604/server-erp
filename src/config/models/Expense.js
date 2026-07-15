import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    vendor: {
      type: String,
      trim: true,
      default: ""
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "Cash"
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Paid"],
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

export default mongoose.model("Expense", expenseSchema);
