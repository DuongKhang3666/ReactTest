import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasRole, isAuthenticated } from "../utils/auth";

function ProtectedRoute({ role }) {
  const location = useLocation();

  // Chưa đăng nhập -> sang /login, nhớ trang định vào (kèm state, ví dụ ghế đã chọn) để quay lại sau khi đăng nhập
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Đã đăng nhập nhưng sai quyền -> đưa về khu vực đúng của vai trò
  if (role && !hasRole(role)) {
    return (
      <Navigate to={hasRole("ADMIN") ? "/admin/dashboard" : "/"} replace />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
