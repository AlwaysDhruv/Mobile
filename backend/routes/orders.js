import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import StoreRider from "../models/StoreRider.js";

import {
  // CART
  addToCart,
  updateCartQuantity,
  getCart,
  removeFromCart,
  clearCart,

  // ORDER MAIN
  createOrder,
  listBuyerOrders,
  listSellerOrders,
  listAvailableOrdersForRider,
  acceptOrder,
  updateStatus,
  approveCancel,
  rejectCancel
} from "../controllers/orderController.js";
import Order from "../models/Order.js";


const router = Router();

/* ---------------------------------------------------------
   🔐 CHECK IF RIDER IS APPROVED FOR ANY STORE
--------------------------------------------------------- */
async function checkRiderApproved(req, res, next) {
  const approved = await StoreRider.findOne({
    rider: req.user._id,
    type: "approved",
  });

  if (!approved) {
    return res.status(403).json({
      message: "Rider not approved for any store",
    });
  }

  next();
}

/* ---------------------------------------------------------
   🛒 CART ROUTES
--------------------------------------------------------- */

// Add product to cart
router.post(
  "/cart",
  auth,
  requireRole("buyer"),
  addToCart
);

// Update quantity (inc/dec)
router.post(
  "/cart/update",
  auth,
  requireRole("buyer"),
  updateCartQuantity
);

// Get full cart
router.get(
  "/cart",
  auth,
  requireRole("buyer"),
  getCart
);

// Remove single cart item
router.delete(
  "/cart/:productId",
  auth,
  requireRole("buyer"),
  removeFromCart
);

// Clear all cart items
router.delete(
  "/cart",
  auth,
  requireRole("buyer"),
  clearCart
);

/* ---------------------------------------------------------
   🛍 BUYER ORDER ROUTES
--------------------------------------------------------- */

// Create order (checkout)
router.post(
  "/",
  auth,
  requireRole("buyer"),
  createOrder
);

// Buyer order list
router.get(
  "/buyer",
  auth,
  requireRole("buyer"),
  listBuyerOrders
);

/* ---------------------------------------------------------
   🧑‍💼 SELLER ORDER ROUTES
--------------------------------------------------------- */

// Seller order list
router.get(
  "/seller",
  auth,
  requireRole("seller"),
  listSellerOrders
);

// Seller approves buyer cancel request
router.patch(
  "/:id/approve-cancel",
  auth,
  requireRole("seller"),
  approveCancel
);

// Seller rejects buyer cancel request
router.patch(
  "/:id/reject-cancel",
  auth,
  requireRole("seller"),
  rejectCancel
);

/* ---------------------------------------------------------
   🚴‍♂️ RIDER ROUTES
--------------------------------------------------------- */

// Rider sees all available pending orders for store(s) he is approved for
router.get(
  "/available",
  auth,
  requireRole("rider"),
  checkRiderApproved,
  listAvailableOrdersForRider
);

// Rider accepts a pending order
router.post(
  "/:id/accept",
  auth,
  requireRole("rider"),
  checkRiderApproved,
  acceptOrder
);

// Rider sees only his assigned / picked / delivered orders
router.get(
  "/rider",
  auth,
  requireRole("rider"),
  checkRiderApproved,
  async (req, res) => {
    const orders = await Order.find({
      rider: req.user._id,
      status: { $ne: "pending" },
    })
      .populate("buyer", "name email")
      .populate("store", "storeName");

    res.json(orders);
  }
);

// Rider or Buyer updates status
router.patch(
  "/:id/status",
  auth,
  updateStatus
);

export default router;
