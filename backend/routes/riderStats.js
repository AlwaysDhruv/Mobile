import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import Order from "../models/Order.js";

const router = Router();

router.get("/", auth, requireRole("rider"), async (req, res) => {
  try {
    const riderId = req.user._id;

    // === Orders summary only ===
    const orders = await Order.find({ rider: riderId });
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "assigned").length;
    const pickedOrders = orders.filter(o => o.status === "picked_up").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;

    res.json({
      totalOrders,
      pendingOrders,
      pickedOrders,
      deliveredOrders
    });

  } catch (err) {
    console.error("Rider stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
