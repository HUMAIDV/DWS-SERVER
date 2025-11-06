import express from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { createNotification } from "../utils/Notify.js";


const router = express.Router();

// 📩 Create new request
router.post("/", async (req, res) => {
  try {
    const { user, type, reason, startDate, endDate } = req.body;
    const newRequest = await LeaveRequest.create({ user, type, reason, startDate, endDate });
    console.log(newRequest);
    
    // 📩 Send mail to participants
        // const emails = await User.find().select("email");
        const adminManagerEmails = await User.find(
        { role: { $in: ["admin", "manager"] } }
        ).distinct("email");

        const uname = await User.findById(user)

    
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: "rbuerlqfepmqwvar",
          },
        });

        const mailOptions = {
          from: `"Digital Workplace Suite" <${process.env.EMAIL_USER}>`,
            // from: process.env.MAIL_USER,
            to: adminManagerEmails,
            subject: `New ${type} Request from ${uname.name}`,
            text: `Please review this request in your dashboard.\n\n-DWS Team`
        }

        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("❌ Error sending mail:", error);
        } else {
            console.log("📧 Email sent:", info.response);
        }
        });
        
        await createNotification({
                      userId: newRequest.user,
                      title: "New Request",
                      message: `${newRequest.type}`,
                      link: `/tasks/${newRequest._id}`,
                      createdBy: newRequest.user,
                    });

    res.json({ success: true, message: "Request submitted", request: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📄 Get all requests (for admin/manager)
router.get("/", async (req, res) => {
  try {
    const requests = await LeaveRequest.find()
      .populate("user", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
});

// 👤 Get user-specific requests
router.get("/:userId", async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch user requests" });
  }
});

// ✅ Approve / ❌ Reject request
router.patch("/:id", async (req, res) => {
  try {
    const { status, reviewedBy } = req.body;
    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy },
      { new: true }
    );

            await createNotification({
                      userId: updated.user,
                      title: `Request ${updated.status}`,
                      message: `${updated.type}`,
                      link: `/tasks/${updated._id}`,
                      createdBy: updated.user,
                    });


    // 2️⃣ Get the email and type safely
    const uname = await User.findById(updated.user)

    const email = uname.email;
    const userName = uname.name || "Employee";
    const type = updated.type;

    // console.log("📨 Sending update to:", email, "Type:", type);
    // console.log(email, type);
    
     if (!email) {
      console.warn("⚠️ No email found for user:", updated.user);
      return res.status(400).json({ success: false, message: "User email not found" });
    }

    const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: "rbuerlqfepmqwvar",
          },
        });

        const mailOptions = {
          from: `"Digital Workplace Suite" <${process.env.EMAIL_USER}>`,
            // from: process.env.MAIL_USER,
            to: email,
            subject: `Request Update`,
            text: `Hello ${userName}, Your ${type} request is ${status}. \n\n-DWS Team`
        }
        transporter.sendMail(mailOptions);
        console.log("📧 Email sent:", info.response);
    
    res.json({ success: true, message: "Request updated", request: updated });
  } catch {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});


export default router;
