import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/fe1.css";

// Khung chung của trang khách do FE1 làm: menu trên, nội dung giữa, chân trang dưới.
// Class "fe1" + "fe1-page": toàn bộ CSS của FE1 chỉ áp dụng bên trong khung này.
export default function MainLayout() {
  return (
    <div className="fe1 fe1-page">
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </div>
  );
}
