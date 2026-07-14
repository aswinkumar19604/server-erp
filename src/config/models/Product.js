import mongoose from "mongoose";

const productSchema =
new mongoose.Schema({

  sku: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },
  minimum_record_qty: {
  type: String,
  default: 10
},
  category: String,

  brand: String,

  price: Number,

  stock: Number,

  description: String,

  status: {
    type: String,
    default: "Active"
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "Product",
  productSchema
);