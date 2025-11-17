import React, { useEffect, useState } from "react";
import { get, post, del } from "../../api.js";
import "./BuyerCart.css";

export default function BuyerCart() {
  const [cart, setCart] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [useNewAddress, setUseNewAddress] = useState(false);
  const [savedAddress, setSavedAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    loadCart();
    loadUserAddress();
  }, []);

  async function loadUserAddress() {
    const user = await get("/auth/me");
    if (user && user.address) setSavedAddress(user.address);
  }

  async function loadCart() {
    const res = await get("/orders/cart");

    if (!res || !res.items) {
      setCart({ items: [] });
      return;
    }

    const fixed = res.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        images: (item.product.images || []).map(img =>
          img.startsWith("http") ? img : `http://localhost:5000${img}`
        ),
      },
    }));

    setCart({ ...res, items: fixed });
  }

  async function updateQty(productId, type) {
    const item = cart.items.find(i => i.product._id === productId);
    if (!item) return;

    let newQty = item.quantity;
    if (type === "inc") newQty++;
    else if (type === "dec" && newQty > 1) newQty--;

    const res = await post("/orders/cart/update", {
      productId,
      quantity: newQty,
    });

    if (res?.message?.includes("Only")) {
      alert(res.message);
      return;
    }

    loadCart();
  }

  async function removeItem(productId) {
    await del(`/orders/cart/${productId}`);
    loadCart();
  }

  async function placeOrder() {
    const finalAddress = useNewAddress ? newAddress : savedAddress;

    if (!finalAddress.trim()) {
      alert("Enter delivery address");
      return;
    }

    const items = cart.items.map(i => ({
      product: i.product._id,
      quantity: i.quantity,
    }));

    const res = await post("/orders", { items, address: finalAddress });

    if (res.message) alert(res.message);
    else alert("Order placed!");

    await del("/orders/cart");
    setCheckoutOpen(false);
    loadCart();
  }

  if (!cart) return <p>Loading...</p>;

  const total = cart.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <div className="buyer-cart">
      <h1 className="cart-title">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {cart.items.map(i => (
              <div key={i.product._id} className="cart-item">

                <img className="cart-img" src={i.product.images[0]} />

                <div className="cart-info">
                  <h3>{i.product.name}</h3>
                  <p className="brand">{i.product.brand}</p>
                  <p className="price">₹{i.product.price}</p>

                  <div className="qty-box">
                    <button onClick={() => updateQty(i.product._id, "dec")}>-</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => updateQty(i.product._id, "inc")}>+</button>
                  </div>
                </div>

                <div className="cart-actions">
                  <button onClick={() => removeItem(i.product._id)} className="remove-btn">
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ₹{total}</h2>
            <button className="checkout-btn" onClick={() => setCheckoutOpen(true)}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {checkoutOpen && (
        <div className="checkout-modal">
          <div className="checkout-box">
            <h2>Checkout</h2>

            <label>Delivery Address</label>

            <select
              value={useNewAddress ? "new" : "saved"}
              onChange={e => setUseNewAddress(e.target.value === "new")}
            >
              {savedAddress && <option value="saved">Use Saved Address</option>}
              <option value="new">Enter New Address</option>
            </select>

            {!useNewAddress && savedAddress && (
              <div className="saved-address-box">
                <strong>Your saved address:</strong>
                <p>{savedAddress}</p>
              </div>
            )}

            {useNewAddress && (
              <textarea
                placeholder="Enter new address..."
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
              ></textarea>
            )}

            <button className="place-btn" onClick={placeOrder}>Place Order</button>
            <button className="cancel" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
