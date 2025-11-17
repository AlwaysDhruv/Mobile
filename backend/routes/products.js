import { Router } from 'express';
import multer from 'multer';
import auth from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProduct,
  getProductsByStore
} from '../controllers/productController.js';

const router = Router();

/* Multer Upload Config */
const upload = multer({
  storage: multer.diskStorage({
    destination: "public/uploads",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  })
});

/* ---------------------------------------------------------
   SELLER ROUTES (MUST COME FIRST)
---------------------------------------------------------- */

// Seller: list their products
router.get(
  "/by-seller",
  auth,
  requireRole("seller"),
  listProducts
);

// Seller: Create a product
router.post(
  "/",
  auth,
  requireRole("seller"),
  upload.array("images", 10),
  createProduct
);

// Seller: Update a product
router.put(
  "/:id",
  auth,
  requireRole("seller"),
  upload.array("images", 10),
  updateProduct
);

// Seller: Delete a product
router.delete(
  "/:id",
  auth,
  requireRole("seller"),
  deleteProduct
);


/* ---------------------------------------------------------
   PUBLIC ROUTES (COME LAST)
---------------------------------------------------------- */

// Public list
router.get("/", listProducts);

// Public product detail
router.get("/:id", getProduct);
router.get("/store/:storeId", getProductsByStore);

export default router;
