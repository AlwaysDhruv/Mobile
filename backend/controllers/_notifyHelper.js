import User from "../models/User.js";
import MailMessage from "../models/MailMessage.js";
import nodemailer from "nodemailer";

export default async function notifyUser(userId, subject, message) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // Save message in DB
    await MailMessage.create({
      sender: null,
      recipient: userId,
      subject,
      message,
      type: "system",
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Mobile Shop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: message,
    });

  } catch (err) {
    console.log("Mail error:", err.message);
  }
}
