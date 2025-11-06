import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives it
    title: { type: String, required: true },
    message: { type: String },
    link: { type: String }, // optional link to navigate in frontend
    isRead: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered the notification
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
