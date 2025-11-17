import { Navigate } from "react-router-dom";

export default function ProtectedRiderRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "rider") return <Navigate to="/login" replace />;
  return children;
}
