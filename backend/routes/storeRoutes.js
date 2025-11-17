import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

import { getMyStore, getStoreById, updateStore } from "../controllers/storeController.js";

import { storeUpload } from "../middleware/storeUpload.js";

const router = Router();

/* ================================
   Seller: Get own store
================================ */
router.get(
  "/my",
  auth,
  requireRole("seller"),
  getMyStore
);

/* ================================
   Public: Get store by ID
================================ */
router.get("/:id", getStoreById);

/* ================================
   Seller: Update store
================================ */
router.patch(
  "/update",
  auth,
  requireRole("seller"),
  storeUpload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 }
  ]),
  updateStore
);

export default router;
