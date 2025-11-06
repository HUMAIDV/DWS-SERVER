import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },     // Meeting date/time
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Employees invited
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" }
}, { timestamps: true });

export default mongoose.model("Meeting", meetingSchema);
