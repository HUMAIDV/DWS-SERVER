// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import taskRoutes from "./routes/taskRoutes.js"
// import userRoutes from "./routes/userRoutes.js"
// import attendanceRoutes from "./routes/attendanceRoutes.js"
// import meetingRoutes from "./routes/meetingRoutes.js";
// import documentRoutes from "./routes/documentRoutes.js"
// import leaveRoutes from "./routes/leaveRoutes.js"
// import notificationRoutes from "./routes/notificationRoutes.js"
// import activityRoutes from "./routes/activityRoutes.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // const cors = require('cors');
// app.use(cors());

// app.use(express.json({ limit: "10mb" })); // increased for image payloads

// // Routes
// app.use("/api/users", userRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/meetings", meetingRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/leave", leaveRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/activity", activityRoutes);


// // Test Route
// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });


// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected ✅");
//    })
//   .catch((err) => console.error("MongoDB connection error:", err));

// app.listen(process.env.PORT || 5000, () => {
//   console.log(`Server running on port ${process.env.PORT || 5000} : http://localhost:${process.env.PORT}`);
// });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http"; // Add this
import { Server } from "socket.io"; // And this

import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app); // Wrap express app

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://dwsuite.netlify.app"],
    methods: ["GET", "POST"],
  },
});

// Socket events
io.on("connection", (socket) => {
  // console.log("🔥 New client connected:", socket.id);

  socket.on("message", (msg) => {
    io.emit("message", msg); // Broadcast to all users
  });

  socket.on("disconnect", () => {
    // console.log("❌ Client disconnected:", socket.id);
  });
});

app.use(cors());

app.use(cors({
  origin: ["http://localhost:5173", "https://dwsuite.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,    // if using cookies or auth headers
}));
// app.options("*", cors());


app.use(express.json({ limit: "10mb" }));

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
  res.send("Backend with Chat is running 🚀");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} at http://localhost:${PORT}`);
});
