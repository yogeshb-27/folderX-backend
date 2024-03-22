const File = require("../models/File");
const User = require("../models/User");
const Folder = require("../models/Folder");

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

module.exports = { uploadFile, deleteFile };
