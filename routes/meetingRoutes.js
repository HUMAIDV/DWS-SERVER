import express from "express";
import Meeting from "../models/Meeting.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import { createNotification } from "../utils/Notify.js";

const router = express.Router();

// ✅ Create a new meeting (Admin/Manager)
router.post("/", async (req, res) => {
  try {
    const { title, description, date, participants, createdBy } = req.body;

    if (!title || !date || !participants?.length) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const meeting = await Meeting.create({ title, description, date, participants, createdBy });

    // 📩 Send mail to participants
    const emails = await User.find({ _id: { $in: participants } }).select("email");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,       // 👈 Use 587 for TLS (working in Render)
  secure: false,   // 👈 Must be false if using 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: "rbuerlqfepmqwvar",
      },
      tls: {
    rejectUnauthorized: false
  }
    });

    for (const e of emails) {
      await transporter.sendMail({
      from: `"Digital Workplace Suite" <${process.env.EMAIL_USER}>`,
        // from: process.env.MAIL_USER,
        to: e.email,
        subject: `New Meeting: ${title}`,
        text: `You have been invited to a meeting on ${new Date(date).toLocaleString()}.\n\nDetails:\n${description || "No description"}\n\n-DWS Team`
      });
    }

    for (const userId of meeting.participants) {
    
        await createNotification({
          userId: userId,
          title: "New Meeting Scheduled",
          message: `${meeting.title}`,
          link: `/tasks/${meeting._id}`,
          createdBy: meeting.createdBy,
        });}

    res.json({ success: true, message: "Meeting scheduled successfully!", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🧾 Get all meetings for a user (Employee view)
router.get("/:userId", async (req, res) => {
  try {
    const meetings = await Meeting.find({
      participants: req.params.userId,
    }).populate("createdBy", "name email");
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🧱 Get all meetings (Admin/Manager)
router.get("/", async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("participants", "name email")
      .populate("createdBy", "name email");
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟠 Update Meeting
router.put("/:id", async (req, res) => {
  try {
    const { title, description, date } = req.body;

    const updated = await Meeting.findByIdAndUpdate(
      req.params.id,
      { title, description, date },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Meeting not found" });
      
    for (const userId of updated.participants) {

      await createNotification({
          userId: userId,
          title: "Meeting Schedule Updated",
          message: `${updated.title}`,
          link: `/tasks/${updated._id}`,
          createdBy: updated.createdBy,
        });}

    res.json({ success: true, message: "Meeting updated", meeting: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔴 Delete Meeting
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Meeting.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Meeting not found" });

    for (const userId of deleted.participants) {

    await createNotification({
          userId: userId,
          title: "Meeting Cancelled",
          message: `${deleted.title}`,
          link: `/tasks/${deleted._id}`,
          createdBy: deleted.createdBy,
        });}

    res.json({ success: true, message: "Meeting deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
