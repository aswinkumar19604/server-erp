import mongoose from "mongoose";

const saleSchema =
new mongoose.Schema({

customer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Customer",
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

  price: {
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
  "Sale",
  saleSchema
);