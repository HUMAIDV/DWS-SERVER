import express from "express";
import Activity from "../models/Activity.js";
import { createNotification } from "../utils/Notify.js";
import User from "../models/User.js";

const router = express.Router();

// Update or create (upsert) activity record
router.post("/", async (req, res) => {
  try {
    const { userId, status, timestamp } = req.body;

    const ActivityData = await Activity.findOne({ userId });

    if (!userId) return res.status(400).json({ success: false, message: "userId required" });

  await Activity.updateOne(
       { userId } ,
       { status, lastActiveAt: timestamp || new Date() },
       { upsert: true } 
  );

    const data = await User.findById(userId)
    // console.log(data);
    // console.log(ActivityData);
    
    if (status === "idle") {
      await createNotification({
        userId: userId,
        title: `${data.name}(${data.role}) is ${status}`,
        message: `${Activity.status}`,
        link: `/activity/${Activity._id}`,
        createdBy: Activity.userId,
      });
    }else if(ActivityData?.status === "idle"){
      await createNotification({
        userId: userId,
        title: `${data.name}(${data.role}) is ${status}`,
        message: `${Activity.status}`,
        link: `/activity/${Activity._id}`,
        createdBy: Activity.userId,
      });
    }else if(status === "break"){
      await createNotification({
        userId: userId,
        title: `Lunch ${status}`,
        message: `${Activity.status}`,
        link: `/activity/${Activity._id}`,
        createdBy: Activity.userId,
      });
    }else if(ActivityData?.status === "break"){
      await createNotification({
        userId: userId,
        title: `${data.name}(${data.role}) is ${status}`,
        message: `${Activity.status}`,
        link: `/activity/${Activity._id}`,
        createdBy: Activity.userId,
      });
    }else{
      console.log("already active");
      
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating activity:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// (Optional) Get all users' activity for admin dashboard
router.get("/", async (req, res) => {
  try {
    const data = await Activity.find().populate("userId", "name email role");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching activity" });
  }
});

export default router;
