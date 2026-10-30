import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/fe1.css";

// Khung chung của mọi trang khách: menu trên, nội dung giữa, chân trang dưới.
// Nội dung giữa (<Outlet />) có thể là trang của FE1, FE2 hoặc FE3.
// Chỉ Navbar/Footer (và các trang FE1 qua Fe1Scope) mới dùng CSS của FE1 (class "fe1").
export default function MainLayout() {
  return (
    <div className="fe1-page">
      <div className="fe1">
        <Navbar />
      </div>
      <div className="fe1-body">
        <Outlet />
      </div>
      <div className="fe1">
        <Footer />
      </div>
    </div>
  );
}
