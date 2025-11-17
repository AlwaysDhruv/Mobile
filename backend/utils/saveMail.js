import nodemailer from "nodemailer";
import MailMessage from "../models/MailMessage.js";
import User from "../models/User.js";

// Send mail to user + store in DB

export async function saveMail(senderId, recipientId, subject, message) {
  try {
    await MailMessage.create({
      sender: senderId,
      recipient: recipientId,
      subject,
      message,
      type: "sent",
      read: false
    });
  } catch (err) {
    console.log("Mail DB save error:", err.message);
  }
}

async function notifyUser(userId, subject, message) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // Store message in DB inbox
    await MailMessage.create({
      sender: null, // system message
      recipient: userId,
      subject,
      message,
      type: "system"
    });

    // SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"Mobile Shop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: message
    });

  } catch (err) {
    console.log("Mail Error:", err.message);
  }
}
