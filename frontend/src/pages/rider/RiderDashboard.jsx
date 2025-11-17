import React, { useEffect, useState } from "react";
import { get } from "../../api.js";
import "../seller/Dashboard.css";

export default function RiderDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    pickedOrders: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const res = await get("/rider/stats");
    if (res) setStats(res);
  }

  return (
    <div className="seller-dashboard">
      <h1 className="dash-title">Rider Dashboard Overview</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalOrders}</h2>
          <p>Total Orders Assigned</p>
        </div>

        <div className="stat-card">
          <h2>{stats.pendingOrders}</h2>
          <p>Pending Deliveries</p>
        </div>

        <div className="stat-card">
          <h2>{stats.pickedOrders}</h2>
          <p>Picked-Up Orders</p>
        </div>

        <div className="stat-card">
          <h2>{stats.deliveredOrders}</h2>
          <p>Delivered Orders</p>
        </div>
      </div>
    </div>
  );
}
