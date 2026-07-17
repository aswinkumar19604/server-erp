import mongoose from "mongoose";

const journalEntryLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  type: {
    type: String,
    enum: ["Debit", "Credit"],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const journalEntrySchema = new mongoose.Schema({
  entryNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  lines: [journalEntryLineSchema],
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  referenceType: {
    type: String,
    enum: ["Sale", "Purchase", "Expense", "Manual"],
    default: "Manual"
  }
}, {
  timestamps: true
});

export default mongoose.model("JournalEntry", journalEntrySchema);
