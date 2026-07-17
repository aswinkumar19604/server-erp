import mongoose from "mongoose";

const salesOrderItemSchema = new mongoose.Schema({
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

const salesOrderSchema = new mongoose.Schema({
  salesOrderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  quotationRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quotation"
  },
  items: [salesOrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    type: String,
    required: true,
    trim: true
  },
  deliveryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ["Draft", "Approved", "Dispatched", "Invoiced", "Cancelled"],
    default: "Draft"
  }
}, {
  timestamps: true
});

export default mongoose.model("SalesOrder", salesOrderSchema);
