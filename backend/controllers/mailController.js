import nodemailer from "nodemailer";
import MailMessage from "../models/MailMessage.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import StoreRider from "../models/StoreRider.js";

export async function sendMail(req, res) {
  try {
    const { recipientId, subject, message } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // ============================
    //   UNRESTRICTED MESSAGING
    // ============================
    // Everyone can message everyone
    const allowed = true;

    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ============================
    //   SAVE MESSAGE IN DATABASE
    // ============================
    const newMail = await MailMessage.create({
      sender: senderId,
      senderEmail: sender.email,
      recipient: recipientId,
      subject,
      message,
      type: "sent",
    });

    // ============================
    //   OPTIONAL SMTP SENDING
    // ============================
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.verify();

      await transporter.sendMail({
        from: `"Mobile Shop" <${process.env.SMTP_USER}>`,
        to: recipient.email,
        subject,
        text: message,
      });
    } catch (smtpErr) {
      console.warn("SMTP Warning:", smtpErr.message);
    }

    res.json({
      success: true,
      message: "Mail sent successfully",
      mail: newMail,
    });

  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ message: "Failed to send mail" });
  }
}

export async function listMails(req, res) {
  try {
    const userId = req.user._id;

    const sent = await MailMessage.find({
      sender: userId,
      recipient: { $ne: userId }
    })
      .populate("recipient", "name email role")
      .sort({ createdAt: -1 });

    const received = await MailMessage.find({
      recipient: userId,
      sender: { $ne: userId }
    })
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });

    res.json({ sent, received });
  } catch (e) {
    console.error("Mail list error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
