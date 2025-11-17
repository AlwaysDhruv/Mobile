import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./RiderLayout.css";

export default function RiderLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="rider-panel">

      <nav className="rider-nav">
        <div className="nav-left">Rider Panel</div>

        <div className="nav-links">
          <NavLink to="/rider" end>Dashboard</NavLink>
          <NavLink to="/rider/orders">Orders</NavLink>
          <NavLink to="/rider/stores">Stores</NavLink>
          <NavLink to="/rider/mail">Mail</NavLink>
        </div>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </nav>

      <div className="rider-content">
        <Outlet />
      </div>

    </div>
  );
}
