import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import nodemailer from "nodemailer";

import { getStoreBuyers, getBuyerOrderHistory, getSellerStats } from "../controllers/sellerStatsController.js";

const router = Router();

// Dashboard stats
router.get("/", auth, requireRole("seller"), getSellerStats);

// Buyer listing with order stats
router.get("/buyers", auth, requireRole("seller"), getStoreBuyers);

// Detailed order history of selected buyer
router.get("/buyers/:buyerId/orders", auth, requireRole("seller"), getBuyerOrderHistory);

router.post("/send-email", auth, requireRole("seller"), async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message)
      return res.status(400).json({ message: "Missing fields" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Email failed" });
  }
});

export default router;
