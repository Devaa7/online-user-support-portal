import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) return <Navigate to="/admin" replace />;
  return children;
}

export default AdminRoute;