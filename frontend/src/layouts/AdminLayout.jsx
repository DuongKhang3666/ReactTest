import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/common/Icon";

const ITEMS = [
  { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/admin/buses", icon: "bus", label: "Xe" },
  { to: "/admin/routes", icon: "route", label: "Tuyến" },
  { to: "/admin/trips", icon: "calendar", label: "Chuyến" },
  { to: "/admin/bookings", icon: "ticket", label: "Vé" },
  { to: "/admin/users", icon: "users", label: "Người dùng" },
];

// Khung trang admin: menu bên trái, nội dung bên phải
export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin">
      <aside>
        <Link to="/admin/dashboard" className="link blue brand"><Icon name="bus" size={24} /> Admin</Link>
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className="link">
            <Icon name={item.icon} size={18} /> {item.label}
          </NavLink>
        ))}
        <Link to="/" className="link"><Icon name="arrow-left" size={16} /> Về trang khách</Link>
        <button type="button" className="link" onClick={handleLogout}>Đăng xuất</button>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
