import Store from "../models/Store.js";

/* ================================
   GET MY STORE (Seller)
================================ */
export async function getMyStore(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });

    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json(store);
  } catch (err) {
    console.log("getMyStore:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================================
   GET STORE BY ID (public)
================================ */
export async function getStoreById(req, res) {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json(store);
  } catch (err) {
    console.log("getStoreById:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================================
   UPDATE STORE INFO
================================ */
export async function updateStore(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });

    if (!store) return res.status(404).json({ message: "Store not found" });

    const fields = [
      "storeName", "description", "phone",
      "address", "city", "state", "pincode",
      "facebook", "instagram", "twitter",
      "isOpen"
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) store[f] = req.body[f];
    });

    // FILE uploads
    if (req.files?.banner) {
      store.banner = "/uploads/store/" + req.files.banner[0].filename;
    }
    if (req.files?.logo) {
      store.logo = "/uploads/store/" + req.files.logo[0].filename;
    }

    await store.save();

    res.json({ message: "Store Updated", store });

  } catch (err) {
    console.log("updateStore:", err);
    res.status(500).json({ message: "Server error" });
  }
}
