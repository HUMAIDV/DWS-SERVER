import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["present", "absent"], default: "present" },
  // loginTime: { type: Date },
  logoutTime: { type: Date }, // add this
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
