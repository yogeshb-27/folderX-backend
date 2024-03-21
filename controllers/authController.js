const User = require("../models/User");
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

module.exports = { register, login };
