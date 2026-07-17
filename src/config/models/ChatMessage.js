import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    recipient: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", ChatMessageSchema);
