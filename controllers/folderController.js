const Folder = require("../models/Folder");
const User = require("../models/User");
const File = require("../models/File");

const getFolderContents = async (req, res) => {
  try {
    const userId = req.user._id;
    const folderId = req.params.folderId;
    let folder;
    let folderName;

    if (folderId === "root") {
      // Fetch root folder data if folderId is not provided
      const user = await User.findById(userId)
        .select("rootFolder")
        .populate({ path: "rootFolder.subFolders", select: "name" })
        .populate({ path: "rootFolder.files", select: "name size type" });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      folder = user.rootFolder;
      folderName = "root";
    } else {
      // Fetch specific folder data if folderId is provided
      folder = await Folder.findById(folderId)
        .select("subFolders files name")
        .populate({ path: "subFolders", select: "name" })
        .populate({ path: "files", select: "name size type" });
      folderName = folder.name;
    }

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const folders = folder.subFolders;
    const files = folder.files;
    // console.log(folders, files, folderName);
    res.status(200).json({ folders, files, folderName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { folderName, parentFolderId } = req.body;

    // Create the new folder
    const newFolder = await Folder.create({ name: folderName, owner: userId });

    // If parentFolderId is provided, add the new folder to its subFolders
    if (parentFolderId !== "root") {
      const parentFolder = await Folder.findById(parentFolderId);
      if (parentFolder) {
        parentFolder.subFolders.push(newFolder._id);
        await parentFolder.save();
      }
    } else {
      // If no parentFolderId is provided, add the new folder to the user's rootFolder
      const user = await User.findById(userId);
      if (user) {
        user.rootFolder.subFolders.push(newFolder._id);
        await user.save();
      }
    }

    res.status(201).json({ message: "Folder created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { newFolderName } = req.body;
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    folder.name = newFolderName;
    await folder.save();
    res.status(200).json({ message: "Folder renamed successfully" });
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  getFolderContents,
  createFolder,
  renameFolder,
};
