import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/common/Spinner";

/**
 * Trang chỉ dành cho khách (Login/Register). Đã đăng nhập thì chuyển đi:
 * về trang người dùng định vào trước đó (state.from) hoặc trang mặc định theo vai trò.
 */
export default function GuestRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <Spinner label="Đang xác thực..." />;
  if (isAuthenticated) {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search ?? ""}` : isAdmin ? "/admin/dashboard" : "/";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
