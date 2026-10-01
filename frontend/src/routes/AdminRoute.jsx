import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

/** Chỉ ADMIN. Chưa đăng nhập -> /login; đã đăng nhập nhưng không phải ADMIN -> thông báo 403. */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner label="Đang xác thực..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) {
    return (
      <div className="container page">
        <EmptyState icon="lock" title="Không đủ quyền truy cập">
          Khu vực này chỉ dành cho quản trị viên.
        </EmptyState>
      </div>
    );
  }
  return <Outlet />;
}
