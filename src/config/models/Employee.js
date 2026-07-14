import mongoose from "mongoose";

const employeeSchema =
  new mongoose.Schema({

    employeeId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    phone: {
      type: String
    },

    department: {
      type: String
    },

    designation: {
      type: String
    },

    salary: {
      type: Number
    },

    status: {
      type: String,
      default: "Active"
    }

  }, {
    timestamps: true
  });

export default mongoose.model(
  "Employee",
  employeeSchema
);