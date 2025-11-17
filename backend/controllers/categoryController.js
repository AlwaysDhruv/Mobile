import Category from "../models/Category.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";

// Create Category
export async function createCategory(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const { name, description, products } = req.body;

    const cat = await Category.create({
      store: store._id,
      name,
      description,
      products: products || []
    });

    res.json(cat);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
}

export async function updateCategory(req, res) {
  try {
    const sellerId = req.user._id;
    const { name, description, products } = req.body;

    const store = await Store.findOne({ seller: sellerId });
    if (!store) return res.status(400).json({ message: 'Store not found' });

    const category = await Category.findOne({ _id: req.params.id, store: store._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // ✅ Only allow seller's store products
    const storeProducts = await Product.find({ store: store._id }).select("_id");
    const allowed = storeProducts.map(p => String(p._id));
    const filtered = (products || []).map(p => String(p)).filter(p => allowed.includes(p));

    category.name = name;
    category.description = description || "";
    category.products = filtered;
    await category.save();

    // ✅ SYNC BOTH SIDES
    // 1. Set category for products included in list
    await Product.updateMany(
      { _id: { $in: filtered } },
      { $set: { category: category._id } }
    );

    // 2. Remove category from products no longer included
    await Product.updateMany(
      { _id: { $nin: filtered }, category: category._id },
      { $set: { category: null } }
    );

    res.json({ message: "Updated & Synced", category });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
}


// Delete Category
export async function deleteCategory(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });

    const category = await Category.findOne({ _id: req.params.id, store: store._id });
    if (!category) return res.status(404).json({ message: "Not found" });

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (e) { res.status(500).json({ message: "Server error" }); }
}


// List Categories
export async function listCategories(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    const list = await Category.find({ store: store._id }).populate("products", "name price");
    res.json(list);
  } catch (e) { res.status(500).json({ message: "Server error" }); }
}

// Get Single Category (restricted to seller's store)
export async function getCategory(req, res) {
  try {
    const sellerId = req.user._id;
    const store = await Store.findOne({ seller: sellerId });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const cat = await Category.findOne({ _id: req.params.id, store: store._id })
      .populate("products", "name price images"); // minimal fields

    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json(cat);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getCategoriesByStore(req, res) {
  try {
    const categories = await Category.find({ store: req.params.storeId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
