import { NavLink, useNavigate } from "react-router-dom";

import busImage from "../../assets/bus.png";
import busIc from "../../assets/ic_bus.svg";
import useric from "../../assets/user.svg";
import routeic from "../../assets/route.svg";
import pro5 from "../../assets/ic_profile_circle.svg";
import dashboardIc from "../../assets/ic_dashboard.svg";
import tripIc from "../../assets/ic_trip.svg";
import ticketIc from "../../assets/ic_ticket.svg";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={busImage} alt="Bus" />
        <h3>Vé xanh</h3>
        <h5>Quản trị hệ thống</h5>
      </div>

      <nav>
        <NavLink to="/admin/dashboard">
          <img src={dashboardIc} alt="Dashboard" /> Dashboard
        </NavLink>

        <NavLink to="/admin/vehicles">
          <img src={busIc} alt="Bus" /> Xe
        </NavLink>

        <NavLink to="/admin/routes">
          <img src={routeic} alt="Route" />
          Tuyến đường
        </NavLink>

        <NavLink to="/admin/trips">
          <img src={tripIc} alt="Trip" />
          Chuyến xe
        </NavLink>

        <NavLink to="/admin/bookings">
          <img src={ticketIc} alt="Booking" />
          Đặt vé
        </NavLink>

        <NavLink to="/admin/users">
          <img src={useric} alt="User" />
          Người dùng
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <hr />

        <div className="pro5">
          <img src={pro5} alt="Profile" />
          <div className="name">
            {user?.fullName || user?.username || "Quản trị"}
          </div>
          <div className="role">Quản Trị viên</div>
        </div>

        <div className="sidebar-actions">
          <NavLink to="/" end>
            Trang khách hàng
          </NavLink>
          <button type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
