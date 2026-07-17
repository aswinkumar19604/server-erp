import mongoose from "mongoose";

const purchaseOrderItemSchema = new mongoose.Schema({
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
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  receivedQuantity: {
    type: Number,
    default: 0
  }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  items: [purchaseOrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ["Draft", "Ordered", "Partially Received", "Fully Received", "Cancelled"],
    default: "Draft"
  },
  notes: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  timestamps: true
});

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
