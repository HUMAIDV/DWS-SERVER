// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },
//     role: {
//       type: String,
//       enum: ["manager", "employee"],
//       default: "employee",
//     },
//     status: {
//       type: String,
//       enum: ["pending", "assigned"],
//       default: "pending",
//     },
//     faceDescriptor: {
//       type: [Number],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);
// export default User;


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, required: true, unique: true },
//     faceDescriptor: [Number],
//     role: { type: String, enum: ["manager", "employee"], default: "employee" },
//     status: { type: String, enum: ["pending", "assigned"], default: "pending" },
//     attendance: [
//       {
//         date: { type: Date, default: Date.now },
//         status: { type: String, enum: ["present", "absent"], default: "present" },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);
// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["pending", "manager", "employee"], // ✅ added "pending"
    default: "pending",
  },
  faceDescriptor: {
    type: [Number], // Face embeddings array
  },
  // status: {
  //   type: String,
  //   enum: ["unassigned", "assigned"],
  //   default: "unassigned",
  // },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;

