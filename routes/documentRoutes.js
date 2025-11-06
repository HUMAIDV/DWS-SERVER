import express from "express";
import Document from "../models/Document.js";
import { createNotification } from "../utils/Notify.js";

const router = express.Router();

// 📤 Upload document metadata (after Firebase upload)
router.post("/", async (req, res) => {
  try {
    const { title, description, fileUrl, uploadedBy, accessibleBy } = req.body;

    if (!fileUrl || !uploadedBy)
      return res.status(400).json({ success: false, message: "File URL and uploader required" });

    const doc = await Document.create({
      title,
      description,
      fileUrl,
      uploadedBy,
      accessibleBy: accessibleBy || [],
    });

    console.log(doc);
    // console.log(doc.accessibleBy._id);
    
    for (const userId of accessibleBy) {
      console.log(userId);
      
      await createNotification({
        userId: userId,
        title: "New Document Uploaded",
        message: `${doc.title || "Document"} has been uploaded.`,
        link: `/documents/${doc._id}`,
        createdBy: doc.uploadedBy,
      });
    }
    // ✅ Send notifications to all users who have access
    // for (const userId of accessibleBy) {
    //   await createNotification({
    //     userId,
    //     title: "New Document Uploaded",
    //     message: `A new document "${title}" has been uploaded.`,
    //     link: `/documents/${doc._id}`,
    //     createdBy: req.user.id,
    //   });

    res.json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error uploading document" });
  }
});

// 📚 Get all documents
router.get("/", async (req, res) => {
  try {
    const docs = await Document.find()
      .populate("uploadedBy", "name email")
      .populate("accessibleBy", "name email");
    res.json({ success: true, docs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update a document
router.put("/:id", async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    for (const userId of doc.accessibleBy) {
    
    await createNotification({
              userId: userId,
              title: "Document Updated",
              message: `${doc.title}`,
              link: `/tasks/${doc._id}`,
              createdBy: doc.uploadedBy,
            });}

    res.json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating document" });
  }
});

// ❌ Delete a document
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    for (const userId of doc.accessibleBy) {

    await createNotification({
              userId: userId,
              title: "Document Deleted",
              message: `${doc.title}`,
              link: `/tasks/${doc._id}`,
              createdBy: doc.uploadedBy,
            });}

    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting document" });
  }
});

export default router;
