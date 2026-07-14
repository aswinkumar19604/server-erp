import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: [
      "sale",
      "purchase",
      "inventory",
      "customer",
      "supplier",
      "employee",
      "system"
    ],
    default: "system"
  },

  isRead: {
    type: Boolean,
    default: false
  }

},
{
  timestamps: true
}
);

export default mongoose.model(
  "Notification",
  notificationSchema
);