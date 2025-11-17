import Order from "../models/Order.js";
import Category from "../models/Category.js";
import ContactMessage from "../models/ContactMessage.js";
import User from "../models/User.js";
import Store from "../models/Store.js";
import mongoose from "mongoose";

export async function getSellerStats(req, res) {
  try {
    const sellerId = req.user.id;

    const store = await Store.findOne({ seller: sellerId });
    if (!store) return res.json({ orders: 0, buyers: 0, categories: 0, messages: 0 });

    const orders = await Order.countDocuments({ store: store._id });

    // ✅ Only count buyers who actually purchased from this store
    const buyers = await Order.distinct("buyer", { store: store._id }).then(b => b.length);

    const categories = await Category.countDocuments({ store: store._id });

    // You can also filter messages per store if needed later
    const messages = await ContactMessage.countDocuments();

    res.json({ orders, buyers, categories, messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Stats fetch error" });
  }
}

export async function getStoreBuyers(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const buyers = await Order.aggregate([
      { $match: { store: store._id } },
      {
        $group: {
          _id: "$buyer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrderDate: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "buyerInfo"
        }
      },
      { $unwind: "$buyerInfo" },
      {
        $project: {
          _id: 1,
          name: "$buyerInfo.name",
          email: "$buyerInfo.email",
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1
        }
      }
    ]);

    res.json(buyers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}


// ✅ Get all past orders of a specific buyer for this store
export async function getBuyerOrderHistory(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const buyerId = req.params.buyerId;

    const orders = await Order.find({ store: store._id, buyer: buyerId })
      .populate("buyer", "name email")
      .populate("items.product", "name images price");

    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}
