import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  res.json({
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET),
    user
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials" });

  res.json({
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET),
    user
  });
};
export const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Invalid Google data" });
    }

    let user = await User.findOne({ email });

    // If user exists
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
