import { Navigate, Outlet } from "react-router-dom";
import { hasRole, isAuthenticated } from "../utils/auth";

function ProtectedRoute({ role }) {
  // if (!isAuthenticated()) {
  //   return <Navigate to="/" replace />;
  // }

  // if (role && !hasRole(role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
}

export default ProtectedRoute;