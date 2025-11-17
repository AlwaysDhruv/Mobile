import StoreRider from "../models/StoreRider.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import MailMessage from "../models/MailMessage.js";
import nodemailer from "nodemailer";

/* =========================================================
   UNIVERSAL MAIL SENDER (with formatted block messages)
========================================================= */
async function notifyUser(userId, subject, message) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    await MailMessage.create({
      sender: null,
      recipient: userId,
      subject,
      message,
      type: "system",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Mobile Shop Notifications" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: message,
    });

  } catch (err) {
    console.log("Mail Error:", err.message);
  }
}

/* =========================================================
   FORMAT FULL DETAIL BLOCK
========================================================= */
function formatDetails({ rider, store, seller, status, action }) {
  return `
Action: ${action}
Status: ${status}

Store Details:
Name: ${store.storeName}
Description: ${store.description || "No description"}

Seller Details:
Name: ${seller.name}
Email: ${seller.email}

Rider Details:
Name: ${rider.name}
Email: ${rider.email}

Timestamp: ${new Date().toLocaleString()}

---------------------------------------
Mobile Shop – Automated Notification
`;
}

/* =========================================================
   RIDER -> REQUEST TO JOIN STORE
========================================================= */
export async function requestToJoinStore(req, res) {
  try {
    const { storeId } = req.body;
    if (!storeId) return res.status(400).json({ message: "storeId required" });

    const exists = await StoreRider.findOne({
      store: storeId,
      rider: req.user._id
    });

    if (exists)
      return res.status(400).json({ message: "Already requested or linked" });

    const store = await Store.findById(storeId)
      .populate("seller", "name email");
    const rider = await User.findById(req.user._id);

    const doc = await StoreRider.create({
      store: storeId,
      rider: req.user._id,
      type: "pending"
    });

    // Email to seller
    await notifyUser(
      store.seller._id,
      "New Rider Join Request",
      formatDetails({
        rider,
        store,
        seller: store.seller,
        status: "Pending Approval",
        action: "A rider has requested to join your store"
      })
    );

    // Email to rider
    await notifyUser(
      rider._id,
      "Join Request Submitted",
      formatDetails({
        rider,
        store,
        seller: store.seller,
        status: "Pending Approval",
        action: "You submitted a request to join the store"
      })
    );

    res.json({ message: "Join request submitted", doc });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   SELLER -> APPROVE RIDER
========================================================= */
export async function approveRequest(req, res) {
  try {
    const { id } = req.params;

    const sr = await StoreRider.findById(id)
      .populate("rider", "name email")
      .populate("store");

    const seller = await User.findById(req.user._id);

    if (!sr) return res.status(404).json({ message: "Request not found" });
    if (String(sr.store.seller) !== String(req.user._id))
      return res.status(403).json({ message: "Not allowed" });

    sr.type = "approved";
    await sr.save();

    // Email to rider
    await notifyUser(
      sr.rider._id,
      "Join Request Approved",
      formatDetails({
        rider: sr.rider,
        store: sr.store,
        seller,
        status: "Approved",
        action: "Your request to join the store has been approved"
      })
    );

    res.json({ message: "Approved", sr });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   SELLER -> REJECT RIDER
========================================================= */
export async function rejectRequest(req, res) {
  try {
    const { id } = req.params;

    const sr = await StoreRider.findById(id)
      .populate("rider", "name email")
      .populate("store");

    const seller = await User.findById(req.user._id);

    if (!sr) return res.status(404).json({ message: "Request not found" });
    if (String(sr.store.seller) !== String(req.user._id))
      return res.status(403).json({ message: "Not allowed" });

    sr.type = "rejected";
    await sr.save();

    await notifyUser(
      sr.rider._id,
      "Join Request Rejected",
      formatDetails({
        rider: sr.rider,
        store: sr.store,
        seller,
        status: "Rejected",
        action: "Your request to join the store was rejected"
      })
    );

    res.json({ message: "Rejected", sr });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   RIDER -> REQUEST REMOVAL
========================================================= */
export async function requestRemove(req, res) {
  try {
    const sr = await StoreRider.findOne({ rider: req.user._id })
      .populate("store")
      .populate("rider", "name email");

    if (!sr) return res.status(404).json({ message: "Not linked to any store" });

    const seller = await User.findById(sr.store.seller);

    sr.type = "removal_pending";
    await sr.save();

    // Notify seller
    await notifyUser(
      seller._id,
      "Rider Removal Request",
      formatDetails({
        rider: sr.rider,
        store: sr.store,
        seller,
        status: "Pending",
        action: "A rider wants to leave your store"
      })
    );

    // Notify rider
    await notifyUser(
      sr.rider._id,
      "Removal Request Submitted",
      formatDetails({
        rider: sr.rider,
        store: sr.store,
        seller,
        status: "Pending",
        action: "You requested removal from the store"
      })
    );

    res.json({ message: "Removal requested", sr });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   SELLER -> APPROVE REMOVAL
========================================================= */
export async function approveRemove(req, res) {
  try {
    const { riderId } = req.params;

    const sr = await StoreRider.findOne({ rider: riderId })
      .populate("rider", "name email")
      .populate("store");

    const seller = await User.findById(req.user._id);

    if (!sr) return res.status(404).json({ message: "Request not found" });
    if (String(sr.store.seller) !== String(req.user._id))
      return res.status(403).json({ message: "Not allowed" });

    await sr.deleteOne();

    // notify rider
    await notifyUser(
      sr.rider._id,
      "Removal Approved",
      formatDetails({
        rider: sr.rider,
        store: sr.store,
        seller,
        status: "Approved",
        action: "Your removal request has been approved"
      })
    );

    res.json({ message: "Rider removed successfully" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   LIST APPROVED STORES FOR RIDER
========================================================= */
export async function listApprovedStoresForRider(req, res) {
  try {
    const approved = await StoreRider.find({
      rider: req.user._id
    })
      .populate("store", "storeName description")
      .populate("rider", "name email");

    res.json(approved);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   LIST APPROVED + REMOVE-PENDING RIDERS FOR SELLER
========================================================= */
export async function listApprovedRidersForStore(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const list = await StoreRider.find({
      store: store._id,
      type: { $in: ["approved", "removal_pending"] }
    })
      .select("rider type createdAt")
      .populate("rider", "name email");

    res.json(list);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   LIST ALL STORES
========================================================= */
export async function listAllStores(req, res) {
  try {
    const stores = await Store.find()
      .select("storeName description")
      .lean();

    res.json(stores);

  } catch (err) {
    console.error("listAllStores error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ---------------------------------------------------------
   Seller views pending join requests
--------------------------------------------------------- */
export async function listRequestsForStore(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const list = await StoreRider.find({
      store: store._id,
      type: "pending"
    }).populate("rider", "name email");

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
