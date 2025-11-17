import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedSellerRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // If no login → go login
  if (!token) return <Navigate to="/login" replace />;

  // If logged in but not seller → kick to home
  if (user.role !== "seller") return <Navigate to="/" replace />;

  return children;
}
