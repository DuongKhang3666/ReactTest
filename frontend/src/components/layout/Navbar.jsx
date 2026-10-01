import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Icon from "../common/Icon";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // UI state

  const close = () => setOpen(false);
  const handleLogout = () => {
    close();
    logout();
    navigate("/", { replace: true });
  };
  const linkClass = ({ isActive }) => (isActive ? "nav__link is-active" : "nav__link");

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand" onClick={close}><Icon name="bus" size={24} /> <span>VéXeOnline</span></Link>
        <button type="button" className="navbar__toggle" aria-expanded={open} aria-label="Mở menu" onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
        <nav className={open ? "nav is-open" : "nav"}>
          <NavLink to="/" end className={linkClass} onClick={close}>Trang chủ</NavLink>
          <NavLink to="/trips" className={linkClass} onClick={close}>Tìm chuyến</NavLink>
          {isAuthenticated && <NavLink to="/bookings" className={linkClass} onClick={close}>Vé của tôi</NavLink>}
          {isAdmin && <NavLink to="/admin/dashboard" className={linkClass} onClick={close}>Quản trị</NavLink>}
          <span className="nav__spacer" />
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={linkClass} onClick={close}><Icon name="user" size={16} /> {user.fullName || user.username}</NavLink>
              <button type="button" className="btn btn--outline btn--sm" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={close}>Đăng nhập</NavLink>
              <Link to="/register" className="btn btn--sm" onClick={close}>Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
