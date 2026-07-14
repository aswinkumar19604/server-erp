import mongoose from "mongoose";

const inventorySchema =
new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  stockIn: {
    type: Number,
    default: 0
  },

  stockOut: {
    type: Number,
    default: 0
  },

  availableStock: {
    type: Number,
    default: 0
  },

  warehouse: {
    type: String,
    default: "Main Warehouse"
  },

  status: {
    type: String,
    default: "In Stock"
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "Inventory",
  inventorySchema
);