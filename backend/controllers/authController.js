import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Store from "../models/Store.js"; // IMPORTANT
import { config } from "../config.js";
import nodemailer from "nodemailer";

/* ============================
   REGISTER USER
============================ */
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing fields" });

    if (!["seller", "buyer", "rider"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    // Create Store automatically for sellers
    if (role === "seller") {
      await Store.create({
        seller: user._id,
        storeName: `${name}'s Store`,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ============================
   LOGIN
============================ */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* ============================
   GET PROFILE
============================ */
export async function getProfile(req, res) {
  const user = await User.findById(req.user._id);
  res.json(user);
}

/* ============================
   UPDATE PROFILE (name, address)
============================ */
export async function updateProfile(req, res) {
  try {
    const { name, address } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (address) user.address = address;

    await user.save();

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
}

/* ============================
   CHANGE PASSWORD
============================ */
export async function changePassword(req, res) {
  try {
    const { oldPass, newPass } = req.body;

    const user = await User.findById(req.user._id);

    const ok = await bcrypt.compare(oldPass, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    user.passwordHash = await bcrypt.hash(newPass, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
}

/* ============================
   DELETE ACCOUNT
============================ */
export async function deleteAccount(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "seller") {
      await Store.deleteOne({ seller: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting account" });
  }
}

/* ============================
   SEND OTP FOR FORGOT PASSWORD
============================ */
async function sendEmail(to, subject, message) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Mobile Shop" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message,
    });

  } catch (err) {
    console.log("Mail Error:", err.message);
  }
}

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.json({ success: true, message: "OTP sent to your email" });

  } catch (err) {
    res.json({ success: false, message: "Failed to send OTP" });
  }
}

/* ============================
   VERIFY OTP
============================ */
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    if (!user.resetOtp || !user.resetOtpExpires)
      return res.json({ success: false, message: "No OTP requested" });

    if (user.resetOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    if (user.resetOtpExpires < Date.now())
      return res.json({ success: false, message: "OTP expired" });

    res.json({ success: true, message: "OTP verified" });

  } catch (err) {
    res.json({ success: false, message: "OTP verification error" });
  }
}

/* ============================
   RESET PASSWORD
============================ */
export async function resetPassword(req, res) {
  try {
    const { email, newPass } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    user.passwordHash = await bcrypt.hash(newPass, 10);
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    res.json({ success: false, message: "Failed to reset password" });
  }
}
