import mongoose from "mongoose";

const supplierSchema =
new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    unique: true
  },

  phone: {
    type: String,
    unique: true
  },

  address: {
    type: String
  },

  gstNumber: {
    type: String
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "Supplier",
  supplierSchema
);