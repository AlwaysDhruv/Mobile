import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-wrapper">

        <div className="header-left" onClick={() => navigate("/")}>
          <span className="brand-icon">📱</span>
          <span className="brand-name">MobileShop</span>
        </div>

        <div className="header-right">
          <Link to="/login" className="header-btn">Login</Link>
          <Link to="/register" className="header-btn highlight">Register</Link>
        </div>

      </div>
    </header>
  );
}
