import mongoose from "mongoose";

const goodsReceiptItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantityReceived: {
    type: Number,
    required: true,
    min: 1
  }
});

const goodsReceiptSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder",
    required: true
  },
  itemsReceived: [goodsReceiptItemSchema],
  receivedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  timestamps: true
});

export default mongoose.model("GoodsReceipt", goodsReceiptSchema);
