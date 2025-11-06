import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  status: { type: String, enum: ["active", "idle", "break"], default: "active" },
  lastActiveAt: { type: Date, default: Date.now },
});

export default mongoose.model("Activity", activitySchema);
