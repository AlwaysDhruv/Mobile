import React, { useEffect, useState } from "react";
import { get, post, patch } from "../../api.js";
import "../seller/Orders.css";

export default function RiderOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.id) {
      console.error("User not logged in.");
      window.location.href = "/login";
      return;
    }
    loadOrders();
  }, []);

  async function loadOrders() {
    const assigned = await get("/orders/rider");        // orders assigned to this rider
    const available = await get("/orders/available");  // open orders

    console.log("Logged-in rider:", user.id);
    console.log("Assigned:", assigned);
    console.log("Available:", available);

    // Normalize assigned orders:
    let assignedToThisRider = assigned.filter(o =>
      String(o.rider?._id || o.rider) === String(user.id)
    );

    // Combine lists
    let finalList = [...available, ...assignedToThisRider];

    // Remove invalid-status orders
    finalList = finalList.filter(
      o => o.status !== "cancelled" && o.status !== "cancel_requested"
    );

    setOrders(finalList);
  }

  async function accept(id) {
    setLoadingId(id);
    try {
      await post(`/orders/${id}/accept`);
    } finally {
      setLoadingId(null);
      loadOrders();
    }
  }

  async function updateStatus(id, status) {
    setLoadingId(id);
    try {
      await patch(`/orders/${id}/status`, { status });
    } finally {
      setLoadingId(null);
      loadOrders();
    }
  }

  function isBusy(id) {
    return loadingId === id;
  }

  function isMyOrder(order) {
    return (
      String(order.rider?._id) === String(user.id) ||
      String(order.rider) === String(user.id)
    );
  }

  return (
    <div className="orders-container">
      <h1 className="page-title">Rider Dashboard</h1>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Store</th>
            <th>Total</th>
            <th>Status</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="order-row">
              
              <td>{order.buyer?.name}</td>
              <td>{order.store?.storeName}</td>

              <td>₹{order.total}</td>

              <td>
                <span className={`status-chip ${order.status}`}>
                  {order.status.replace("_", " ")}
                </span>
              </td>

              <td>{order.address}</td>

              <td>

                {/* Accept order */}
                {order.status === "pending" && !order.rider && (
                  <button
                    className="view-btn"
                    disabled={isBusy(order._id)}
                    onClick={() => accept(order._id)}
                  >
                    {isBusy(order._id) ? "Processing..." : "Accept"}
                  </button>
                )}

                {/* Picked Up */}
                {order.status === "assigned" && isMyOrder(order) && (
                  <button
                    className="primary-btn"
                    disabled={isBusy(order._id)}
                    onClick={() => updateStatus(order._id, "picked_up")}
                  >
                    {isBusy(order._id) ? "Updating..." : "Picked Up"}
                  </button>
                )}

                {/* Delivered */}
                {order.status === "picked_up" && isMyOrder(order) && (
                  <button
                    className="primary-btn"
                    disabled={isBusy(order._id)}
                    onClick={() => updateStatus(order._id, "delivered")}
                  >
                    {isBusy(order._id) ? "Completing..." : "Delivered"}
                  </button>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
