import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

import {
  requestToJoinStore,
  listRequestsForStore,
  approveRequest,
  rejectRequest,
  listApprovedStoresForRider,
  listApprovedRidersForStore
} from "../controllers/riderStoreController.js";

import Store from "../models/Store.js";

const router = Router();

// Rider requests to join a store
router.post("/request", auth, requireRole("rider"), requestToJoinStore);

// Rider list approved stores
router.get("/approved", auth, requireRole("rider"), listApprovedStoresForRider);

// 🔥 Rider list ALL stores (needed for Choose Store)
router.get("/stores/all", auth, requireRole("rider"), async (req, res) => {
  try {
    const list = await Store.find().select("storeName description");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Seller views pending requests
router.get("/requests", auth, requireRole("seller"), listRequestsForStore);

// Seller views approved riders
router.get("/approved-riders", auth, requireRole("seller"), listApprovedRidersForStore);

// Seller approves rider request
router.patch("/requests/:id/approve", auth, requireRole("seller"), approveRequest);

// Seller rejects rider request
router.patch("/requests/:id/reject", auth, requireRole("seller"), rejectRequest);

export default router;
