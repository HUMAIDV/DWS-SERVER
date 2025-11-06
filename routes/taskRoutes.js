import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import { createNotification } from "../utils/Notify.js";

const router = express.Router();

// console.log("lo");

// ➤ Create Task
// router.post("/", async (req, res) => {
//   try {
//     const { title, assignedTo, createdBy, dueDate } = req.body;

//     if (!title || !assignedTo || !createdBy) {
//       return res.status(400).json({ error: "Title, AssignedTo, and CreatedBy are required" });
//     }

//     const task = await Task.create({ title, assignedTo, createdBy, dueDate });
//     res.status(201).json(task);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// ✅ POST: Create new task and notify employee
router.post("/", async (req, res) => {
  try {
    const { title, dueDate, assignedTo, createdBy } = req.body;

    if (!title || !dueDate || !assignedTo || !createdBy) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Save the new task
    const newTask = await Task.create({
      title,
      dueDate,
      assignedTo,
      createdBy,
    });

    // Find the assigned employee
    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await createNotification({
      userId: assignedTo,
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${title}`,
      link: `/tasks/${newTask._id}`,
      createdBy: createdBy,
    });
    // console.log(createNotification);
    

    // ✅ Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        // pass: process.env.EMAIL_PASS, // app-specific password
        pass: "rbuerlqfepmqwvar", // app-specific password
      },
    });

    const mailOptions = {
      from: `"Digital Workplace Suite" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject: `New Task Assigned: ${title}`,
      html: `
        <h2>Hi ${employee.name},</h2>
        <p>You have been assigned a new task.</p>
        <p><b>Task:</b> ${title}</p>
        <p><b>Deadline:</b> ${new Date(dueDate).toDateString()}</p>
        <p>Please log in to your dashboard to view details.</p>
        <br/>
        <p>– DWS Team</p>
      `,
    };
    // console.log(mailOptions);
    

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error sending mail:", error);
      } else {
        console.log("📧 Email sent:", info.response);
      }
    });

    res.json({
      success: true,
      message: "Task created, notification and email sent",
      task: newTask,
    });
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ➤ Get All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo createdBy");
    // const tasks = await Task.find().populate(res.json());
    res.json(tasks);
    // console.log("hi");
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ➤ Get Task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo createdBy", "name email role");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    
    await createNotification({
      userId: task.assignedTo._id,
      title: "Task Updated",
      message: `${task.title}`,
      link: `/tasks/${task._id}`,
      createdBy: task.createdBy,
    });

    // console.log(task.assignedTo._id,createNotification);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➤ Update Task
router.put("/:id", async (req, res) => {
  try {
    const { title, status, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, status, dueDate },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ➤ Delete Task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    await createNotification({
      userId: task.assignedTo._id,
      title: "Task Deleted",
      message: `${task.title}`,
      link: `/tasks/${task._id}`,
      createdBy: task.createdBy,
    });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
