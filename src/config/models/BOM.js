import mongoose from "mongoose";

const bomComponentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.1
  }
});

const bomSchema = new mongoose.Schema({
  finishedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true // A finished product should only have one active BOM formulation recipe
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  components: [bomComponentSchema]
}, {
  timestamps: true
});

export default mongoose.model("BOM", bomSchema);
