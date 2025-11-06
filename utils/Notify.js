import Notification from "../models/Notification.js";

export const createNotification = async ({ userId, title, message, link, createdBy }) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      link,
      createdBy,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

