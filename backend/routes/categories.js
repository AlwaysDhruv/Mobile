import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategoriesByStore
} from "../controllers/categoryController.js";

import Category from "../models/Category.js";

const router = Router();

/* ----------------------------------------------------
    PUBLIC BUYER ROUTE
    MUST BE AT TOP (before :id routes)
----------------------------------------------------*/
router.get("/all", async (req, res) => {
  try {
    const list = await Category.find({})
      .select("name description")
      .populate("products", "name price images brand");

    res.json(list);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------------------------------
    SELLER PROTECTED ROUTES
----------------------------------------------------*/
router.get("/by-seller", auth, requireRole("seller"), listCategories);

router.get("/:id", auth, requireRole("seller"), getCategory);

router.post("/", auth, requireRole("seller"), createCategory);

router.put("/:id", auth, requireRole("seller"), updateCategory);

router.delete("/:id", auth, requireRole("seller"), deleteCategory);
router.get("/store/:storeId", getCategoriesByStore);

export default router;
