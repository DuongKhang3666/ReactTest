import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Bọc các trang yêu cầu đăng nhập. Chưa đăng nhập thì chuyển sang /login
// và nhớ trang đang định vào để quay lại sau khi đăng nhập.
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
