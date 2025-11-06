// import express from "express";
// import User from "../models/User.js";
// import { euclideanDistance } from "face-api.js";

// const router = express.Router();

// // REGISTER new user with face descriptor
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, descriptor } = req.body;
//     if (!descriptor) return res.status(400).json({ success: false, message: "Face not detected" });

//     const user = new User({ name, email, faceDescriptor: descriptor });
//     await user.save();
//     res.json({ success: true, message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // MANAGER assigns role to user
// router.patch("/:id/assign", async (req, res) => {
//   try {
//     const { role } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { role, status: "assigned" },
//       { new: true }
//     );
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.json({ success: true, message: "Role assigned successfully", user });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // LOGIN with face recognition
// router.post("/login", async (req, res) => {
//   try {
//     const { descriptor } = req.body;
//     if (!descriptor) return res.status(400).json({ success: false, message: "No face descriptor" });

//     const users = await User.find();
//     for (const user of users) {
//       const distance = euclideanDistance(descriptor, user.faceDescriptor);
//       if (distance < 0.6) {
//         return res.json({
//           success: true,
//           message: `Welcome ${user.name}`,
//           user: {
//             id: user._id,
//             name: user.name,
//             role: user.role,
//             status: user.status,
//           },
//         });
//       }
//     }

//     res.json({ success: false, message: "Face not recognized" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// export default router;


// import express from "express";
// import User from "../models/User.js";
// import * as faceapi from "face-api.js";

// const router = express.Router();

// // ✅ 1. Check user after Auth0 login
// router.post("/check", async (req, res) => {
//   const { email, name } = req.body;
//   let user = await User.findOne({ email });

//   if (!user) {
//     user = new User({ email, name });
//     await user.save();
//     return res.json({ exists: false, registered: false, user });
//   }

//   const registered = user.faceDescriptor.length > 0;
//   res.json({ exists: true, registered, user });
// });

// // ✅ 2. Register face
// router.post("/register", async (req, res) => {
//   const { name, email, descriptor } = req.body;
//   let user = await User.findOne({ email });

//   if (!user) {
//     user = new User({ name, email, faceDescriptor: descriptor });
//   } else {
//     user.name = name;
//     user.faceDescriptor = descriptor;
//   }

//   await user.save();
//   res.json({ success: true, message: "Face registered successfully!" });
// });

// // ✅ 3. Login (face validation + mark attendance)
// router.post("/login", async (req, res) => {
//   const { descriptor } = req.body;
//   const users = await User.find({ faceDescriptor: { $exists: true, $ne: [] } });

//   for (const user of users) {
//     const distance = faceapi.euclideanDistance(descriptor, user.faceDescriptor);
//     if (distance < 0.6) {
//       user.attendance.push({ status: "present" });
//       await user.save();
//       return res.json({
//         success: true,
//         message: "Face recognized successfully!",
//         user,
//       });
//     }
//   }

//   res.json({ success: false, message: "Face not recognized" });
// });

// export default router;

import express from "express";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getCurrentUser } from "../controllers/userController.js";

const router = express.Router();


router.get("/me", requireAuth, getCurrentUser);

// Register new user with face
router.post("/register", async (req, res) => {
  const {auth0Id, name, email, descriptor } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      user.faceDescriptor = descriptor;
      await user.save();
      return res.json({ success: true, message: "Face updated successfully!" });
    }

    user = await User.create({auth0Id, name, email, faceDescriptor: descriptor });
    res.json({ success: true, message: "Face registered successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login and mark attendance
// Login (only verifies face, does NOT mark attendance)
router.post("/login", async (req, res) => {
  const { descriptor, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.faceDescriptor) {
      return res.json({ success: false, message: "Face not registered" });
    }

    // Compare simple Euclidean distance
    const distance = Math.sqrt(
      user.faceDescriptor.reduce(
        (sum, val, i) => sum + (val - descriptor[i]) ** 2,
        0
      )
    );

    if (distance < 0.5) {
      // ✅ Check if user's role is still pending
      if (user.role === "pending") {
        return res.status(403).json({
          success: false,
          message: "Your manager has not assigned you a role yet. Attendance not marked.",
        });
      }

      // ✅ Return only login success (no attendance creation)
      return res.json({ success: true, user, message: "Face verified. Login successful!" });
    } else {
      return res.json({ success: false, message: "Face not matched" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all pending users
router.get("/pending", async (req, res) => {
  console.log("✅ /api/users/pending route hit"); // add this

  try {
    const users = await User.find({ role: "pending" });
    console.log("🧑‍💻 Pending users found:", users.length);

    res.json({ success: true, users });
  } catch (err) {
    console.error("❌ Error fetching pending users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Get all employees (approved users only)
router.get("/employees", async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("name email _id");
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// get by id
router.get("/:auth0Id", async (req, res) => {
  const { auth0Id } = req.params;
  const user = await User.findOne({ auth0Id });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});


// Assign role to a user
router.patch("/assign-role", async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!["manager", "employee", "pending"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: `${user.name}'s role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
