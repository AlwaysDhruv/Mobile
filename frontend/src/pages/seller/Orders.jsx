import React, { useEffect, useState } from "react";
import { get, patch } from "../../api.js";
import "./Orders.css";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("buyer");
  const [sortField, setSortField] = useState("date");

  const [loadingId, setLoadingId] = useState(null); // Loader per-button

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await get("/orders/seller");
    setOrders(res || []);
  }

  function toggle(id) {
    setExpanded(expanded === id ? null : id);
  }

  async function handleApprove(id) {
    if (!confirm("Approve cancel request?")) return;
    setLoadingId(id);
    await patch(`/orders/${id}/approve-cancel`);
    setLoadingId(null);
    load();
  }

  async function handleReject(id) {
    if (!confirm("Reject cancel request?")) return;
    setLoadingId(id);
    await patch(`/orders/${id}/reject-cancel`);
    setLoadingId(null);
    load();
  }

  const filtered = orders.filter(order => {
    const v =
      filterField === "buyer" ? order.buyer?.name :
      filterField === "rider" ? order.rider?.name :
      filterField === "status" ? order.status :
      "";
    return v?.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "total") return b.total - a.total;
    if (sortField === "status") return a.status.localeCompare(b.status);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="orders-container">

      <h1 className="page-title">Store Orders</h1>

      <div className="order-filters">
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={filterField} onChange={e => setFilterField(e.target.value)}>
          <option value="buyer">Buyer</option>
          <option value="rider">Rider</option>
          <option value="status">Status</option>
        </select>

        <select value={sortField} onChange={e => setSortField(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="total">Sort by Amount</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Buyer</th>
            <th>Rider</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {sorted.map(order => (
            <React.Fragment key={order._id}>
              <tr className="order-row">

                <td>{order._id}</td>
                <td>{order.buyer?.name || "Unknown"}</td>

                <td>
                  {order.rider ? (
                    <div className="rider-data">
                      <div>{order.rider.name}</div>
                      <small>{order.rider.email || "N/A"}</small>
                    </div>
                  ) : (
                    <span className="no-rider">No Rider</span>
                  )}
                </td>

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

                  {order.status === "cancel_requested" && (
                    <>
                      <button
                        className="approve-btn"
                        disabled={loadingId === order._id}
                        onClick={() => handleApprove(order._id)}
                      >
                        {loadingId === order._id ? "Processing..." : "Approve"}
                      </button>

                      <button
                        className="reject-btn"
                        disabled={loadingId === order._id}
                        onClick={() => handleReject(order._id)}
                      >
                        {loadingId === order._id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  )}
                </td>
              </tr>

              {expanded === order._id && (
                <tr className="details-row">
                  <td colSpan="7">
                    <div className="order-details">

                      <h4>Delivery Address</h4>
                      <p>{order.address}</p>

                      <h4>Items</h4>
                      <table className="inner-items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(i => (
                            <tr key={i._id}>
                              <td>{i.name}</td>
                              <td>₹{i.price}</td>
                              <td>{i.quantity}</td>
                              <td>₹{i.price * i.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="order-total-box">
                        Total: <strong>₹{order.total}</strong>
                      </div>

                      {order.rider && (
                        <div className="rider-info-box">
                          <h4>Assigned Rider</h4>
                          <p><strong>Name:</strong> {order.rider.name}</p>
                          <p><strong>Email:</strong> {order.rider.email || "N/A"}</p>
                        </div>
                      )}
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
