const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
