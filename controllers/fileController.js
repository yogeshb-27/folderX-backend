const File = require("../models/File");
const User = require("../models/User");
const Folder = require("../models/Folder");
const { sendMail } = require("../services/sendMail");

const uploadFile = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const userId = req.user._id;
    let folder;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize)
      return res.status(400).json({ error: "File size exceeds limit (15 MB)" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userQuota = 50 * 1024 * 1024;
    if (user.usedStorage + file.size > userQuota) {
      const userEmail = user.email;
      try {
        await sendMail(userEmail);
      } catch (emailError) {
        console.error("Error sending quota exceeded email:", emailError);
      }
      return res.status(400).json({ error: "User quota exceeded" });
    }

    const newFile = await File.create({
      name: file.originalname,
      type: file.originalname.split(".").pop().toLowerCase(),
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
      owner: userId,
    });

    if (folderId === "root") {
      user.rootFolder.files.push(newFile._id);
      await user.save();
    } else {
      folder = await Folder.findOne({ _id: folderId, owner: userId });
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      folder.files.push(newFile._id);
      await folder.save();
    }

    return res.status(201).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error during file upload:", error);
    return res.status(500).json({ message: "File upload failed" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const folderId = req.body.folderId;
    const file = await File.findById(fileId).select("_id");
    if (!file) return res.status(404).json({ message: "File not found" });

    if (folderId == "root") {
      const user = await User.findById(req.user._id);
      if (user) {
        user.rootFolder.files = user.rootFolder.files.filter(
          (id) => id.toString() !== fileId
        );
        await user.save();
      }
    } else {
      await Folder.findByIdAndUpdate(
        folderId,
        { $pull: { files: fileId } },
        { new: true }
      );
    }
    await File.findByIdAndDelete(fileId);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
};

const renameFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { newFileName } = req.body;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });
    file.name = newFileName;
    await file.save();
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).json({ message: "Error renaming file" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=${file.name}`);
    return res.end(file.data);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
};

const getFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById({ _id: fileId });
    if (!file) return res.status(404).json({ message: "File not found" });
    const fileDetails = {
      name: file.name,
      type: file.type,
      size: file.size,
      mimeType: file.mimeType,
      content: file.data.toString("base64"),
    };
    res.status(200).json(fileDetails);
  } catch (error) {
    console.error("Error fetching file details:", error);
    res.status(500).json({ message: "Error fetching file details" });
  }
};

module.exports = { uploadFile, deleteFile, renameFile, downloadFile, getFile };
