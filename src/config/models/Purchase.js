import mongoose from "mongoose";

const purchaseSchema =
new mongoose.Schema({

supplier: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Supplier",
  required: true
},

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  quantity: {
    type: Number,
    required: true
  },

  purchasePrice: {
    type: Number,
    required: true
  },

  total: {
    type: Number
  },

  paymentStatus: {
    type: String,
    default: "Paid"
  },

  invoiceNumber: {
    type: String,
    unique: true
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "Purchase",
  purchaseSchema
);