// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.js";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d";

// 🔑 helper to create JWT
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/** ───────────── SIGNUP ───────────── **/
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    res.json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── SIGNIN ───────────── **/
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = createToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Signin Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── FORGOT PASSWORD ───────────── **/
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetURL = `http://localhost:5050/auth/api/reset-password/${resetToken}`;

    // ✅ Create SMTP transporter (example: your own mail server or AWS SES)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g. "smtp.gmail.com" or "email-smtp.ap-south-1.amazonaws.com"
      port: process.env.SMTP_PORT || 587, // 465 for SSL, 587 for TLS
      secure: process.env.SMTP_SECURE === "true", // true if port 465
      auth: {
        user: process.env.SMTP_USER, // your SMTP username
        pass: process.env.SMTP_PASS, // your SMTP password
      },
      tls: {
        rejectUnauthorized: false, // helps if you have self-signed certs
      },
    });

    // ✅ Verify SMTP connection before sending (optional)
    await transporter.verify();

    // ✅ Send mail
    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.name || ""},</p>
        <p>Click <a href="${resetURL}">here</a> to reset your password.</p>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── RESET PASSWORD ───────────── **/
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
