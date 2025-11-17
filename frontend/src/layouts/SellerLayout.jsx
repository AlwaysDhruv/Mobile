import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./SellerLayout.css";

export default function SellerLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="seller-panel">

      {/* TOP NAVIGATION */}
      <nav className="seller-nav">
        <div className="nav-hover-zone"></div> {/* Add this line */}
          <div className="nav-left">Seller Panel</div>
  
          <div className="nav-links">
            <NavLink to="/seller" end>Dashboard</NavLink>
            <NavLink to="/seller/products">Products</NavLink>
            <NavLink to="/seller/categories">Series</NavLink>
            <NavLink to="/seller/users">Users</NavLink>
            <NavLink to="/seller/orders">Orders</NavLink>
            <NavLink to="/seller/riders">Riders</NavLink>
            <NavLink to="/seller/mail">Mail</NavLink>
            <NavLink to="/seller/store">Store Info</NavLink>   {/* NEW */}
          </div>
  
          <div className="nav-right">
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
      </nav>

      <div className="seller-content">
        <Outlet />
      </div>

    </div>
  );
}
