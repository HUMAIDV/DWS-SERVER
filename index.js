import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import attendanceRoutes from "./routes/attendanceRoutes.js"
import meetingRoutes from "./routes/meetingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js"
import leaveRoutes from "./routes/leaveRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import activityRoutes from "./routes/activityRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// const cors = require('cors');
app.use(cors());

app.use(express.json({ limit: "10mb" })); // increased for image payloads

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
   })
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000} : http://localhost:${process.env.PORT}`);
});