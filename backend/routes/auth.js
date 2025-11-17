import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  sendOtp,
  verifyOtp,
  resetPassword
} from "../controllers/authController.js";

import auth from "../middleware/authMiddleware.js";

const router = Router();

// Base auth
router.post("/register", register);
router.post("/login", login);

// Profile actions
router.get("/me", auth, getProfile);
router.patch("/update", auth, updateProfile);
router.patch("/change-password", auth, changePassword);

// Delete account
router.delete("/delete", auth, deleteAccount);

// ----- FORGOT PASSWORD ROUTES -----
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
