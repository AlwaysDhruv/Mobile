import React, { useEffect, useState } from "react";
import { get } from "../../api";
import { useParams } from "react-router-dom";

export default function BuyerOrderHistory() {
  const { buyerId } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await get(`/seller/buyers/${buyerId}/orders`);
    setOrders(res);
  }

  return (
    <div>
      <h2>Order History</h2>

      {orders.map(order => (
        <div key={order._id} className="order-card">
          <h3>Order #{order._id}</h3>
          <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
          <p>Status: {order.status}</p>
          <p>Address: {order.address}</p>

          <h4>Items:</h4>
          <ul>
            {order.items.map(i => (
              <li key={i._id}>
                {i.name} — ₹{i.price} × {i.quantity}
              </li>
            ))}
          </ul>

          <strong>Total: ₹{order.total}</strong>
        </div>
      ))}
    </div>
  );
}
