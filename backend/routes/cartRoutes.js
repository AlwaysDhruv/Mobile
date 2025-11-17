import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = Router();

// Add to cart
router.post("/cart", auth, requireRole("buyer"), addToCart);

// Get buyer cart
router.get("/cart", auth, requireRole("buyer"), getCart);

// Remove specific product from cart
router.delete("/cart/:productId", auth, requireRole("buyer"), removeFromCart);

// Clear all cart items
router.delete("/cart", auth, requireRole("buyer"), clearCart);

export default router;
