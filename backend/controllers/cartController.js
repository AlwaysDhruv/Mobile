// ============================================
//      IMPORT MODELS
// ============================================
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import StoreRider from "../models/StoreRider.js";
import User from "../models/User.js";

// ============================================
//               CART CONTROLLERS
// ============================================

// ADD TO CART (with stock check)
export async function addToCart(req, res) {
  try {
    const buyerId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.qty < 1)
      return res.status(400).json({ message: "Out of stock" });

    let cart = await Cart.findOne({ buyer: buyerId });

    if (!cart) {
      cart = await Cart.create({
        buyer: buyerId,
        items: [{ product: productId, quantity: 1 }]
      });
    } else {
      const item = cart.items.find(i => String(i.product) === productId);

      if (item) {
        if (item.quantity + 1 > product.qty)
          return res.status(400).json({
            message: `Only ${product.qty} items left`
          });

        item.quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1 });
      }

      cart.updatedAt = Date.now();
      await cart.save();
    }

    res.json({ message: "Added to cart", cart });
  } catch (e) {
    console.log("addToCart:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// UPDATE QUANTITY (with stock check)
export async function updateCartQuantity(req, res) {
  try {
    const buyerId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Not found" });

    if (quantity > product.qty)
      return res.status(400).json({
        message: `Only ${product.qty} items left`
      });

    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) return res.status(400).json({ message: "Cart empty" });

    const item = cart.items.find(i => String(i.product) === productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: "Quantity updated", cart });
  } catch (e) {
    console.log("updateCartQuantity:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// GET CART
export async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id })
      .populate("items.product");

    res.json(cart || { items: [] });
  } catch (e) {
    console.log("getCart:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// REMOVE ITEM
export async function removeFromCart(req, res) {
  try {
    const buyerId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(
      i => String(i.product) !== productId
    );

    await cart.save();
    res.json({ message: "Removed", cart });
  } catch (e) {
    console.log("removeFromCart:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// CLEAR CART
export async function clearCart(req, res) {
  try {
    await Cart.deleteOne({ buyer: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

// ============================================
//               ORDER CONTROLLERS
// ============================================

// CREATE ORDER + STOCK REDUCE
export async function createOrder(req, res) {
  try {
    const buyerId = req.user._id;
    const { items, address } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ message: "No items" });

    const ids = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: ids } });

    if (products.length !== items.length)
      return res.status(400).json({ message: "Some products missing" });

    // CHECK STOCK
    for (const i of items) {
      const product = products.find(p => String(p._id) === i.product);
      if (product.qty < i.quantity)
        return res.status(400).json({
          message: `${product.name} only has ${product.qty} in stock`
        });
    }

    // DEDUCT STOCK
    for (const i of items) {
      await Product.findByIdAndUpdate(
        i.product,
        { $inc: { qty: -i.quantity } }
      );
    }

    // BUILD ORDER
    let total = 0;
    const orderItems = products.map((p) => {
      const qty = items.find(i => String(i.product) === String(p._id))?.quantity || 1;
      total += p.price * qty;

      return {
        product: p._id,
        name: p.name,
        price: p.price,
        quantity: qty,
      };
    });

    const order = await Order.create({
      store: products[0].store,
      buyer: buyerId,
      seller: products[0].seller,
      items: orderItems,
      total,
      address,
      status: "pending",
    });

    await order.populate("buyer seller store");

    res.json(order);

  } catch (e) {
    console.log("createOrder:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// LIST BUYER ORDERS
export async function listBuyerOrders(req, res) {
  try {
    const list = await Order.find({ buyer: req.user._id })
      .populate("seller", "name email")
      .populate("rider", "name email")
      .populate("store", "storeName");

    res.json(list);
  } catch (e) {
    console.log("listBuyerOrders:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// LIST SELLER ORDERS
export async function listSellerOrders(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const list = await Order.find({ store: store._id })
      .populate("buyer", "name email")
      .populate("rider", "name email");

    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

// RIDER — AVAILABLE ORDERS
export async function listAvailableOrdersForRider(req, res) {
  try {
    const approved = await StoreRider.find({
      rider: req.user._id,
      type: "approved",
    });

    if (!approved.length) return res.json([]);

    const stores = approved.map(s => s.store);

    const list = await Order.find({
      store: { $in: stores },
      status: "pending",
    }).populate("buyer store");

    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

// RIDER — ACCEPT ORDER
export async function acceptOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer seller store");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "pending")
      return res.status(400).json({ message: "Order unavailable" });

    const approved = await StoreRider.findOne({
      store: order.store._id,
      rider: req.user._id,
      type: "approved",
    });

    if (!approved)
      return res.status(403).json({ message: "Not approved for this store" });

    order.rider = req.user._id;
    order.status = "assigned";
    await order.save();

    res.json(order);

  } catch (e) {
    console.log("acceptOrder:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// RIDER / BUYER STATUS UPDATE
export async function updateStatus(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const role = req.user.role;
    const { status } = req.body;

    // BUYER CANCEL REQUEST
    if (role === "buyer") {
      if (order.status !== "pending")
        return res.status(400).json({ message: "Can't cancel now" });

      order.status = "cancel_requested";
      await order.save();
      return res.json(order);
    }

    // RIDER UPDATES
    if (role === "rider") {
      if (String(order.rider) !== String(req.user._id))
        return res.status(403).json({ message: "Not your order" });

      if (!["assigned", "picked_up", "delivered"].includes(status))
        return res.status(400).json({ message: "Invalid status" });

      order.status = status;
      await order.save();
      return res.json(order);
    }

    return res.status(403).json({ message: "Not allowed" });

  } catch (e) {
    console.log("updateStatus:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// SELLER APPROVE CANCEL
export async function approveCancel(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "cancel_requested")
      return res.status(400).json({ message: "Buyer did not request cancel" });

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (e) {
    console.log("approveCancel:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// SELLER REJECT CANCEL
export async function rejectCancel(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "cancel_requested")
      return res.status(400).json({ message: "Buyer didn't request cancel" });

    order.status = "pending";
    await order.save();

    res.json(order);
  } catch (e) {
    console.log("rejectCancel:", e);
    res.status(500).json({ message: "Server error" });
  }
}
