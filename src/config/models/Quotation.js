import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  items: [quotationItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Draft", "Sent", "Approved", "Rejected", "Expired"],
    default: "Draft"
  }
}, {
  timestamps: true
});

export default mongoose.model("Quotation", quotationSchema);
