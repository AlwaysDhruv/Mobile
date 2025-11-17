import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// in routes/riderStoreRoutes.js (or the file you posted)
import {
  requestToJoinStore,
  listRequestsForStore,
  approveRequest,
  rejectRequest,
  listApprovedStoresForRider,
  listApprovedRidersForStore,
  requestRemove,
  approveRemove,
  listAllStores
} from "../controllers/riderStoreController.js";

const router = Router();

// Rider
router.post("/request", auth, requireRole("rider"), requestToJoinStore);
router.get("/approved", auth, requireRole("rider"), listApprovedStoresForRider);
router.patch("/request-remove", auth, requireRole("rider"), requestRemove);
router.get("/stores/all", listAllStores);

// Seller
router.get("/requests", auth, requireRole("seller"), listRequestsForStore);
router.get("/approved-riders", auth, requireRole("seller"), listApprovedRidersForStore);
router.patch("/requests/:id/approve", auth, requireRole("seller"), approveRequest);
router.patch("/requests/:id/reject", auth, requireRole("seller"), rejectRequest);

router.patch("/approve-remove/:riderId", auth, requireRole("seller"), approveRemove);

export default router;
