const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rootFolder: {
    subFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
  },
  usedStorage: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
