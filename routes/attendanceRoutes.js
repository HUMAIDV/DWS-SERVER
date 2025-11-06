import express from "express";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";



const router = express.Router();

// console.log("loaded");
/**
 * ✅ Mark attendance (called after successful face verification)
 * POST /api/attendance/mark
 * body: { email }
 */
// router.post("/mark", async (req, res) => {
//   console.log("📥 Attendance /mark HIT", req.body);
//   try {
//     const { email } = req.body;

//     console.log("🟡 Attendance mark attempt for:", email);

//     if (!email)
//       return res
//         .status(400)
//         .json({ success: false, message: "Email required" });

//     const user = await User.findOne({ email });

//     if (!user) {
//       console.log("🔴 User not found:", email);
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // 🚫 Hard stop: prevent attendance if role is still pending
//     if (user.role?.toLowerCase() === "pending") {
//       console.log(`⛔ Attendance blocked for ${email} (role: ${user.role})`);
//       return res.status(403).json({
//         success: false,
//         message:
//           "Your manager has not assigned you a role yet. Attendance not marked.",
//       });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // 🧠 Check if attendance already exists for today
//     const existing = await Attendance.findOne({
//       userId: user._id,
//       date: { $gte: today },
//     });

//     if (existing) {
//       console.log(`🟠 Attendance already marked for ${email}`);
//       return res.status(400).json({
//         success: false,
//         message: "Attendance already marked for today.",
//       });
//     }

//     // ✅ Mark attendance
//     const attendance = new Attendance({
//       user: user._id,
//       role: user.role,
//       date: new Date(),
//       status: "present",
//     });

//     await attendance.save();
//     console.log(`🟢 Attendance marked for ${email} (${user.role})`);

//     res.json({
//       success: true,
//       message: "Attendance marked successfully.",
//       attendance,
//     });
//   } catch (err) {
//     console.error("🔥 Error marking attendance:", err);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });

router.post("/mark", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // 🚫 Prevent marking if role is still pending
    if (user.role === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your manager has not assigned you a role yet. Attendance not marked.",
      });
    }

   // 🧭 Get today's start and end times for accurate filtering
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 🛑 Check if already marked today
    const existingAttendance = await Attendance.findOne({
      user: user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingAttendance && existingAttendance.status === "present") {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked as present for today.",
      });
    }


    // ✅ Otherwise mark attendance
    const attendance = new Attendance({
      user: user._id,
      role: user.role,
      date: new Date(),
      status: "present",
    });

    await attendance.save();

    return res.json({
      success: true,
      message: "Attendance marked successfully.",
      attendance,
    });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});


/**
 * ✅ Get all attendance records (Manager view)
 * GET /api/attendance
 */
// Get all attendance (admin/manager)
router.get("/", async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("user", "name email role") // populate user details
      .sort({ createdAt: -1 });

    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// routes/attendanceRoute.js
router.post("/logout", async (req, res) => {
  console.log("🟢 /api/attendance/logout called:", req.body);

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // Get today's start and end of day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find today’s attendance record for the user with status 'present'
    const attendance = await Attendance.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: "present",
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No active (present) attendance found for today.",
      });
    }

    // Update status to absent and add logout time
    attendance.status = "absent";
    attendance.logoutTime = new Date();
    await attendance.save();

    console.log("✅ Attendance updated to absent:", attendance);

    return res.json({
      success: true,
      message: "Attendance updated to absent successfully.",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
