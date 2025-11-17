import React, { useEffect, useState } from "react";
import { get, patch, post } from "../../api.js";
import "./BuyerOrders.css";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loadingId, setLoadingId] = useState(null); // loader

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const res = await get("/orders/buyer");
    setOrders(res || []);
  }

  function toggle(id) {
    setExpanded(expanded === id ? null : id);
  }

  async function requestCancel(id) {
    if (!confirm("Send cancel request to seller?")) return;
    setLoadingId(id);
    await patch(`/orders/${id}/status`, { status: "cancel_requested" });
    setLoadingId(null);
    loadOrders();
  }

  async function reorder(order) {
    setLoadingId(order._id);
    const items = order.items.map(i => ({
      product: i.product,
      quantity: i.quantity,
    }));

    await post("/orders", { items, address: order.address });
    setLoadingId(null);
    alert("Order placed again!");
  }

  const filtered = orders.filter(o => {
    const matchText =
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())) ||
      o._id.includes(search);

    const matchFilter = filter === "all" ? true : o.status === filter;

    return matchText && matchFilter;
  });

  return (
    <div className="buyer-orders">
      <h1 className="orders-title">Your Orders</h1>

      <div className="order-controls">
        <input
          type="text"
          placeholder="Search by item or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="cancel_requested">Cancel Requested</option>
          <option value="assigned">Assigned</option>
          <option value="picked_up">Picked Up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(order => (
            <React.Fragment key={order._id}>
              <tr className="order-row">

                <td className="order-id">{order._id}</td>

                <td>
                  <span className={`status-chip ${order.status}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </td>

                <td>₹{order.total}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>

                <td>
                  <button className="view-btn" onClick={() => toggle(order._id)}>
                    {expanded === order._id ? "Hide" : "Details"}
                  </button>

                  {order.status === "pending" && (
                    <button
                      className="cancel-btn"
                      disabled={loadingId === order._id}
                      onClick={() => requestCancel(order._id)}
                    >
                      {loadingId === order._id ? "Sending..." : "Request Cancel"}
                    </button>
                  )}

                  {order.status === "delivered" && (
                    <button
                      className="reorder-btn"
                      disabled={loadingId === order._id}
                      onClick={() => reorder(order)}
                    >
                      {loadingId === order._id ? "Placing..." : "Reorder"}
                    </button>
                  )}
                </td>
              </tr>

              {expanded === order._id && (
                <tr className="details-row">
                  <td colSpan="5">
                    <div className="order-details">

                      <p><strong>Delivery Address:</strong> {order.address}</p>

                      {(order.rider && ["assigned", "picked_up", "delivered"].includes(order.status)) && (
                        <div className="rider-box">
                          <h4>Your Rider</h4>
                          <p><strong>Name:</strong> {order.rider.name}</p>
                          <p><strong>Email:</strong> {order.rider.email || "N/A"}</p>
                        </div>
                      )}

                      <h4>Items</h4>
                      <div className="items-box">
                        {order.items.map(i => (
                          <div key={i._id} className="item-line">
                            <span>{i.name}</span>
                            <span>₹{i.price} × {i.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <strong>Total:</strong> ₹{order.total}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
