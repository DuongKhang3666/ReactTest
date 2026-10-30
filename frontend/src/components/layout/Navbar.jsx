import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Icon from "../common/Icon";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header>
      <div className="container row">
        <nav>
          <Link to="/" className="link blue brand">
            <Icon name="bus" size={24} /> VéXeOnline
          </Link>
          <NavLink to="/" end className="link">
            Trang chủ
          </NavLink>
          <NavLink to="/trips" className="link">
            Tìm chuyến
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/my-bookings" className="link">
              Vé của tôi
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/dashboard" className="link">
              Quản trị
            </NavLink>
          )}
        </nav>

        <nav>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="link">
                <Icon name="user" size={16} /> {user.fullName || user.username}
              </NavLink>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="link">
                Đăng nhập
              </NavLink>
              <Link to="/register" className="btn">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
