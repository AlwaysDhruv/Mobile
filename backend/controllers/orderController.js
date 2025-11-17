import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import StoreRider from "../models/StoreRider.js";
import MailMessage from "../models/MailMessage.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

/* ---------------------------------------------------------
   FULL ORDER DETAILS FOR EMAILS
--------------------------------------------------------- */
function buildOrderDetails(order) {
  const itemsList = order.items
    .map(i => `${i.name} (x${i.quantity}) - ₹${i.price * i.quantity}`)
    .join("\n");

  return `
Order ID: ${order._id}
Status: ${order.status}

Store:
${order.store?.storeName || "N/A"}

Buyer:
Name: ${order.buyer?.name || "N/A"}
Email: ${order.buyer?.email || "N/A"}

Seller:
Name: ${order.seller?.name || "N/A"}
Email: ${order.seller?.email || "N/A"}

Rider:
Name: ${order.rider?.name || "Not Assigned"}
Email: ${order.rider?.email || "N/A"}

Delivery Address:
${order.address}

Items:
${itemsList}

Total Amount: ₹${order.total}

Placed On: ${order.createdAt?.toLocaleString()}

-------------------------------
Mobile Shop
Thank you for using our service.
`;
}

/* ---------------------------------------------------------
   GLOBAL EMAIL SENDER
--------------------------------------------------------- */
async function notifyUser(userId, subject, message, details = "") {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const fullMessage = `${message}\n\n${details}`;

    await MailMessage.create({
      sender: null,
      recipient: userId,
      subject,
      message: fullMessage,
      type: "system",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Mobile Shop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: fullMessage,
    });

  } catch (err) {
    console.log("Mail Error:", err.message);
  }
}

/* ---------------------------------------------------------
    CART FUNCTIONS
--------------------------------------------------------- */

// Add to Cart
export async function addToCart(req, res) {
  try {
    const buyer = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ buyer });

    if (!cart) {
      cart = await Cart.create({
        buyer,
        items: [{ product: productId, quantity: 1 }],
      });
    } else {
      const item = cart.items.find(i => String(i.product) === productId);
      if (item) {
        item.quantity++;
      } else {
        cart.items.push({ product: productId, quantity: 1 });
      }
      await cart.save();
    }

    res.json({ message: "Added to cart" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Update cart quantity
export async function updateCartQuantity(req, res) {
  try {
    const buyer = req.user._id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ buyer });
    if (!cart) return res.status(400).json({ message: "Cart not found" });

    const item = cart.items.find(i => String(i.product) === productId);
    if (!item) return res.status(400).json({ message: "Item not found" });

    const product = await Product.findById(productId);

    if (quantity > product.qty) {
      return res.status(400).json({
        message: `Only ${product.qty} units available`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Quantity updated" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Get Cart
export async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id })
      .populate("items.product");

    res.json(cart || { items: [] });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Remove From Cart
export async function removeFromCart(req, res) {
  try {
    const buyer = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ buyer });
    if (!cart) return res.json({ message: "Cart empty" });

    cart.items = cart.items.filter(i => String(i.product) !== productId);
    await cart.save();

    res.json({ message: "Removed" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Clear Cart
export async function clearCart(req, res) {
  try {
    await Cart.deleteOne({ buyer: req.user._id });
    res.json({ message: "Cart cleared" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* ---------------------------------------------------------
    ORDER FUNCTIONS
--------------------------------------------------------- */

export async function createOrder(req, res) {
  try {
    const buyerId = req.user._id;
    const { items, address } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ message: "No items" });

    const ids = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: ids } });

    // qty validation
    for (let item of items) {
      const p = products.find(x => String(x._id) === item.product);
      if (item.quantity > p.qty)
        return res.status(400).json({ message: `${p.name} has only ${p.qty} left` });
    }

    // qty deduction
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { qty: -item.quantity }
      });
    }

    const storeId = products[0].store;
    const sellerId = products[0].seller;

    let total = 0;

    const orderItems = products.map(p => {
      const qty = items.find(i => String(i.product) === String(p._id)).quantity;
      total += p.price * qty;

      return {
        product: p._id,
        name: p.name,
        price: p.price,
        quantity: qty,
      };
    });

    const order = await Order.create({
      buyer: buyerId,
      seller: sellerId,
      store: storeId,
      items: orderItems,
      total,
      address,
      status: "pending",
    });

    await order.populate("buyer seller store");

    const details = buildOrderDetails(order);

    await notifyUser(buyerId, "Order Placed", "Your order has been placed.", details);
    await notifyUser(sellerId, "New Order Received", "You received a new order.", details);

    res.json(order);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* BUYER ORDERS */
export async function listBuyerOrders(req, res) {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("seller", "name email")
      .populate("store", "storeName")
      .populate("rider", "name email");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* SELLER ORDERS */
export async function listSellerOrders(req, res) {
  try {
    const store = await Store.findOne({ seller: req.user._id });

    const orders = await Order.find({ store: store._id })
      .populate("buyer", "name email")
      .populate("rider", "name email");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* RIDER AVAILABLE ORDERS */
export async function listAvailableOrdersForRider(req, res) {
  try {
    const approvedStores = await StoreRider.find({
      rider: req.user._id,
      type: "approved"
    }).select("store");

    const storeIds = approvedStores.map(s => s.store);

    const orders = await Order.find({
      store: { $in: storeIds },
      status: "pending",
    })
      .populate("buyer", "name email")
      .populate("store", "storeName");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function acceptOrder(req, res) {
  try {
    let order = await Order.findById(req.params.id)
      .populate("buyer seller store");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "pending")
      return res.status(400).json({ message: "Not available" });

    order.rider = req.user._id;
    order.status = "assigned";
    await order.save();

    // Repopulate rider
    order = await order.populate("rider", "name email");

    const details = buildOrderDetails(order);

    await notifyUser(order.buyer, "Order Assigned", "A rider has been assigned.", details);
    await notifyUser(order.seller, "Rider Assigned", "A rider accepted your order.", details);
    await notifyUser(order.rider, "Order Assigned To You", "You accepted this order.", details);

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* UPDATE STATUS */
export async function updateStatus(req, res) {
  try {
    let order = await Order.findById(req.params.id)
      .populate("buyer seller rider store");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const { status } = req.body;
    const role = req.user.role;

    // BUYER cancel request
    if (role === "buyer") {
      order.status = "cancel_requested";
      await order.save();

      const details = buildOrderDetails(order);
      await notifyUser(order.seller, "Buyer Requested Cancellation", "A buyer requested cancellation.", details);

      return res.json({ message: "Cancel requested", order });
    }

    // RIDER updates status
    if (role === "rider") {
      if (!["assigned", "picked_up", "delivered"].includes(status))
        return res.status(400).json({ message: "Invalid status" });

      order.status = status;
      await order.save();

      // Repopulate rider to show name + email
      order = await Order.findById(order._id)
        .populate("buyer seller rider store");

      const details = buildOrderDetails(order);

      if (status === "picked_up") {
        await notifyUser(order.buyer, "Order Picked Up", "Rider picked up your order.", details);
        await notifyUser(order.seller, "Order Picked Up", "Rider picked up the order.", details);
        await notifyUser(order.rider, "You Picked Up Order", "You have picked up the order.", details);
      }

      if (status === "delivered") {
        await notifyUser(order.buyer, "Order Delivered", "Your order has been delivered.", details);
        await notifyUser(order.seller, "Order Delivered", "Order delivered to the buyer.", details);
        await notifyUser(order.rider, "Delivery Completed", "You delivered the order.", details);
      }

      return res.json({ message: "Status updated", order });
    }

    res.status(403).json({ message: "Not allowed" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* APPROVE CANCEL */
export async function approveCancel(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer seller rider store");

    order.status = "cancelled";
    await order.save();

    const details = buildOrderDetails(order);

    await notifyUser(order.buyer, "Cancellation Approved", "Seller approved cancellation.", details);
    await notifyUser(order.seller, "You Approved Cancellation", "You approved cancellation.", details);

    if (order.rider) {
      await notifyUser(order.rider, "Order Cancelled", "Order assigned to you was cancelled.", details);
    }

    res.json({ message: "Cancel approved", order });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

/* REJECT CANCEL */
export async function rejectCancel(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer seller rider store");

    order.status = "pending";
    await order.save();

    const details = buildOrderDetails(order);

    await notifyUser(order.buyer, "Cancellation Rejected", "Seller rejected cancellation.", details);
    await notifyUser(order.seller, "You Rejected Cancellation", "You rejected the cancellation request.", details);

    res.json({ message: "Cancel rejected", order });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
