import nodemailer from "nodemailer";
import { saveMail } from "./saveMail.js";

export async function sendMail(sender, recipient, subject, message) {
  try {
    if (!recipient?.email) return;

    // Save in DB inbox
    await saveMail(sender._id, recipient._id, subject, message);

    // Send actual email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    await transporter.sendMail({
      from: `"Mobile Shop" <${process.env.SMTP_USER}>`,
      to: recipient.email,
      subject,
      text: message,
    });

    console.log("📨 Email + Inbox saved →", subject);

  } catch (err) {
    console.log("Mail error:", err.message);
  }
}
