import Product from '../models/Product.js';
import Store from '../models/Store.js';
import Category from '../models/Category.js';

/* ============================================================
   CREATE PRODUCT
============================================================ */
export async function createProduct(req, res) {
  try {
    const sellerId = req.user._id;
    const store = await Store.findOne({ seller: sellerId });

    if (!store) return res.status(400).json({ message: "Store not found" });

    const {
      name, brand, description, price, qty, category,
      ram, storage, battery, display, processor, camera, os, color
    } = req.body;

    if (!name || !price)
      return res.status(400).json({ message: "Name & price required" });

    let categoryId = null;

    if (category) {
      const cat = await Category.findOne({ _id: category, store: store._id });
      if (!cat) return res.status(400).json({ message: "Invalid category" });
      categoryId = category;
    }

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const product = await Product.create({
      seller: sellerId,
      store: store._id,
      category: categoryId,
      name,
      brand,
      description,
      price,
      qty,

      // Mobile specs
      ram,
      storage,
      battery,
      display,
      processor,
      camera,
      os,
      color,

      images
    });

    res.json(product);

  } catch (e) {
    console.log("Create Product Error:", e);
    res.status(500).json({ message: "Server error" });
  }
}


/* ============================================================
   UPDATE PRODUCT
============================================================ */
export async function updateProduct(req, res) {
  try {
    const sellerId = req.user._id;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Not found" });
    if (String(product.seller) !== String(sellerId))
      return res.status(403).json({ message: "Not your product" });

    // Handle category validation
    if ("category" in req.body) {
      if (!req.body.category) {
        req.body.category = null;
      } else {
        const store = await Store.findOne({ seller: sellerId });
        const cat = await Category.findOne({ _id: req.body.category, store: store._id });
        if (!cat) return res.status(400).json({ message: "Invalid category" });
      }
    }

    // Replace images if uploaded
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    // Update all fields including mobile specs
    Object.assign(product, req.body);
    await product.save();

    res.json(product);

  } catch (e) {
    console.log("Update Product Error:", e);
    res.status(500).json({ message: "Server error" });
  }
}


/* ============================================================
   DELETE PRODUCT
============================================================ */
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Not found" });
    if (String(product.seller) !== String(req.user._id))
      return res.status(403).json({ message: "Not your product" });

    await product.deleteOne();
    res.json({ message: "Deleted" });

  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}


/* ============================================================
   LIST PRODUCTS
============================================================ */
export async function listProducts(req, res) {
  try {
    const filter = {};

    // If seller, only show seller's products
    if (req.user && req.user.role === "seller") {
      filter.seller = req.user._id;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const list = await Product.find(filter)
      .populate("category", "name")
      .populate("store", "storeName");

    res.json(list);

  } catch (e) {
    console.log("List Product Error:", e);
    res.status(500).json({ message: "Server error" });
  }
}


/* ============================================================
   GET SINGLE PRODUCT
============================================================ */
export async function getProduct(req, res) {
  try {
    let p = await Product.findById(req.params.id)
      .populate("seller", "name email")
      .populate("category", "name")
      .populate("store", "storeName")
      .lean();

    if (!p) return res.status(404).json({ message: "Not found" });

    // Convert image paths to full URLs
    p.images = (p.images || []).map(img =>
      img.startsWith("http") ? img : `http://localhost:5000${img}`
    );

    // Ensure all mobile fields exist
    const fields = ["ram", "storage", "battery", "display", "processor", "camera", "os", "color"];
    fields.forEach(f => { if (!p[f]) p[f] = ""; });

    res.json(p);

  } catch (e) {
    console.log("Get Product Error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getProductsByStore(req, res) {
  try {
    const list = await Product.find({ store: req.params.storeId })
      .populate("category", "name");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
