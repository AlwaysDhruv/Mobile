import User from '../models/User.js';
import ContactMessage from '../models/ContactMessage.js';
import nodemailer from 'nodemailer'; // optional, see install note

// POST /api/contact
export async function submitContact(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'name, email and message required' });

    // find all seller emails
    const sellers = await User.find({ role: 'seller' }).select('email name');
    const sellerEmails = sellers.map(s => s.email).filter(Boolean);

    // store message
    const doc = await ContactMessage.create({
      name, email, subject: subject || 'Contact from site', message,
      recipients: sellerEmails
    });

    // optional: send email to sellers if SMTP configured
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass && sellerEmails.length) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
          auth: { user, pass }
        });

        // send a single email with all seller addresses in BCC
        await transporter.sendMail({
          from: `"MobileShop Contact" <${user}>`,
          to: user, // to yourself as fallback
          bcc: sellerEmails,
          subject: `[Contact] ${subject || 'Message from site'}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`
        });
      } catch (mailErr) {
        console.error('Mail send failed', mailErr);
        // don't fail the request — message is stored
      }
    }

    return res.json({ message: 'Message received', id: doc._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
