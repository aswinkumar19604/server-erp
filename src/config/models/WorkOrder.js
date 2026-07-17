import mongoose from "mongoose";

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true
  },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BOM",
    required: true
  },
  productToProduce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantityToProduce: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ["Planned", "In Progress", "Completed", "Cancelled"],
    default: "Planned"
  },
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model("WorkOrder", workOrderSchema);
