import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

import "./admin.css";

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <Sidebar />

            <div className="main-wrapper">
                <Header />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
