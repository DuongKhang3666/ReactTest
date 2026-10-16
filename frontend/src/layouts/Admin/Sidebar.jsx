import { NavLink } from "react-router-dom";

import busImage from "../../assets/bus.png";
import busIc from "../../assets/ic_bus.svg";
import useric from "../../assets/user.svg";
import routeic from "../../assets/route.svg";
import pro5 from "../../assets/ic_profile_circle.svg";

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">
                <img src={busImage} alt="Bus" />
                <h3>Vé xanh</h3>
                <h5>Quản trị hệ thống</h5>
            </div>

            <nav>
                <NavLink to="/admin/vehicles">
                    <img src={busIc} alt="Bus" /> Xe
                </NavLink>

                <NavLink to="/admin/routes">
                    <img src={routeic} alt="Bus" />Tuyến đường
                </NavLink>

                <NavLink to="/admin/trips">
                    Chuyến xe
                </NavLink>

                <NavLink to="/admin/users">
                    <img src={useric} alt="Bus" />Người dùng
                </NavLink>

                <NavLink to="/admin/bookings">
                    Bookings
                </NavLink>
                
            </nav>

            <div className="sidebar-bottom">
                <hr />

                <div className="pro5">
                    <img src={pro5} alt="Profile" />
                    <div className="name">Tên</div>
                    <div className="role">Quản Trị viên</div>
                </div>
            </div>
        </aside>
    );
}
