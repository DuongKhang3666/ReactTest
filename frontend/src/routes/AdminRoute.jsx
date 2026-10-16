import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import EmptyState from "../components/common/EmptyState";

// Bọc các trang chỉ dành cho ADMIN.
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return (
      <div className="container">
        <EmptyState icon="lock" title="Không đủ quyền truy cập">
          Khu vực này chỉ dành cho quản trị viên.
        </EmptyState>
      </div>
    );
  }
  return <Outlet />;
}
