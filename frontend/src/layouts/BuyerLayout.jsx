import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./BuyerLayout.css";

export default function BuyerLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="buyer-panel">
      
      {/* Top Navigation */}
      <nav className="buyer-nav">
        <div className="buyer-nav-left">Mobile Shop</div>

        <div className="buyer-nav-links">
          <NavLink to="/buyer" end>Home</NavLink>
          <NavLink to="/buyer/cart">Cart</NavLink>
          <NavLink to="/buyer/orders">Orders</NavLink>
          <NavLink to="/buyer/profile">Profile</NavLink>
        </div>

        <div className="buyer-nav-right">
          <span className="buyer-username">{user?.name}</span>
          <button className="buyer-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="buyer-content">
        <Outlet />
      </div>
    </div>
  );
}
