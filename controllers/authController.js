const User = require("../models/User");
const File = require("../models/File");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Check if password contains at least one capital letter
    const hasCapital = /[A-Z]/.test(password);
    if (!hasCapital) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one capital letter" });
    }

    // Check if password contains at least one digit
    const hasDigit = /\d/.test(password);
    if (!hasDigit) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one digit" });
    }

    // Check if password contains at least one special character
    const hasSpecial = /[!@#$%^&*()_+]/.test(password);
    if (!hasSpecial) {
      return res.status(400).json({
        error: "Password must contain at least one special character",
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const newUser = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid Email" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRETKEY);
    return res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getUserStorageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const userFiles = await File.find({ owner: userId }).select(
        "size mimeType type"
      );
      let storageStats = {
        total: { size: 0, count: 0 },
        images: { size: 0, count: 0 },
        videos: { size: 0, count: 0 },
        docs: { size: 0, count: 0 },
        other: { size: 0, count: 0 },
      };

      userFiles.forEach((file) => {
        storageStats.total.size += file.size;
        storageStats.total.count += 1;
        if (file.mimeType.includes("image") || file.type == "heic") {
          storageStats.images.size += file.size;
          storageStats.images.count += 1;
        } else if (file.mimeType.includes("video")) {
          storageStats.videos.size += file.size;
          storageStats.videos.count += 1;
        } else if (
          file.mimeType.includes("pdf") ||
          file.mimeType.includes("spreadsheet") ||
          file.mimeType.includes("presentation") ||
          file.mimeType.includes("document") ||
          file.mimeType.includes("json") ||
          file.mimeType.includes("md") ||
          file.mimeType.includes("text")
        ) {
          storageStats.docs.size += file.size;
          storageStats.docs.count += 1;
        } else {
          storageStats.other.size += file.size;
          storageStats.other.count += 1;
        }
      });

      user.usedStorage = storageStats.total.size;
      await user.save();
      return res.status(200).json({ storageStats });
    }
  } catch (error) {
    console.error("Error fetching used storage:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

module.exports = { register, login, getUserStorageStats };
