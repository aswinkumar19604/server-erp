import mongoose from "mongoose";

const stockHistorySchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  actionType: {
    type: String,
    enum: [
      "SALE",
      "PURCHASE",
      "SALE_DELETE",
      "PURCHASE_DELETE",
      "GOODS_RECEIPT",
      "PRODUCTION",
      "DEDUCTION"
    ],
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  previousStock: {
    type: Number,
    required: true
  },

  newStock: {
    type: Number,
    required: true
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "StockHistory",
  stockHistorySchema
);