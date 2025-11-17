import React, { useEffect, useState } from "react";
import { get } from "../../api.js";
import SendMailBox from "../../components/SendMailBox.jsx";
import "./Users.css";

export default function SellerUsers() {
  const [buyers, setBuyers] = useState([]);
  const [expandedBuyer, setExpandedBuyer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [mailTo, setMailTo] = useState(null);

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("name");

  useEffect(() => { loadBuyers(); }, []);

  async function loadBuyers() {
    const res = await get("/seller/buyers");
    setBuyers(res);
  }

  async function toggleOrders(buyerId) {
    if (expandedBuyer === buyerId) return setExpandedBuyer(null);
    setExpandedBuyer(buyerId);
    const res = await get(`/seller/buyers/${buyerId}/orders`);
    setOrders(res);
  }

  const filteredBuyers = buyers.filter((b) =>
    b[searchField]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="buyers-container">
      <h1>Customers</h1>

      <div className="search-box">
        <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
          <option value="name">By Name</option>
          <option value="email">By Email</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="buyers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Total Spent</th>
            <th>Last Order</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredBuyers.map((b) => (
            <React.Fragment key={b._id}>
              <tr>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{b.totalOrders}</td>
                <td>₹{b.totalSpent}</td>
                <td>{new Date(b.lastOrderDate).toLocaleDateString()}</td>
                <td>
                  <button className="view-btn" onClick={() => toggleOrders(b._id)}>
                    {expandedBuyer === b._id ? "Hide" : "Orders"}
                  </button>

                  <button className="mail-btn" onClick={() => setMailTo(b.email)}>
                    Send Mail
                  </button>
                </td>
              </tr>

              {expandedBuyer === b._id && (
                <tr className="orders-row">
                  <td colSpan="6">
                    {orders.length === 0 ? (
                      <p className="no-orders">No past orders.</p>
                    ) : (
                      orders.map((order) => (
                        <div key={order._id} className="order-card">
                          <p><strong>Order ID:</strong> {order._id}</p>
                          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                          <h4>Items:</h4>
                          {order.items.map(i => (
                            <p key={i._id}>{i.name} — ₹{i.price} × {i.quantity}</p>
                          ))}
                          <p><strong>Total:</strong> ₹{order.total}</p>
                        </div>
                      ))
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {mailTo && <SendMailBox email={mailTo} onClose={() => setMailTo(null)} />}
    </div>
  );
}
