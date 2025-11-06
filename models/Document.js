import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String }, // optional now
  description: String,
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessibleBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ], // users allowed to access this file
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", documentSchema);
