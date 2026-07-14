import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
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
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Customer", customerSchema);