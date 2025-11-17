import React, { useEffect, useState } from "react";
import { get } from "../../api.js";
import "./Dashboard.css";

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    buyers: 0,
    categories: 0,
    messages: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const res = await get("/seller");
    if (res) setStats(res);
  }

  return (
    <div className="seller-dashboard">

      <h1 className="dash-title">Dashboard Overview</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h2>{stats.orders}</h2>
          <p>Total Orders</p>
        </div>

        <div className="stat-card">
          <h2>{stats.buyers}</h2>
          <p>Total Buyers</p>
        </div>

        <div className="stat-card">
          <h2>{stats.categories}</h2>
          <p>Total Categories</p>
        </div>

        <div className="stat-card">
          <h2>{stats.messages}</h2>
          <p>Messages</p>
        </div>

      </div>

    </div>
  );
}
