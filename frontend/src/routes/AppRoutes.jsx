import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PlaceholderPage from "../components/common/PlaceholderPage";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/customer/Home";
import SearchTrips from "../pages/customer/SearchTrips";
import Profile from "../pages/customer/Profile";
import Dashboard from "../pages/admin/Dashboard";

/*
 * Các route đánh dấu PlaceholderPage là phần của FE2/FE3:
 * khi làm xong chỉ cần thay element bằng page thật (giữ nguyên path).
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<SearchTrips />} />
          <Route path="/trips/:id" element={<PlaceholderPage title="Chi tiết chuyến & chọn ghế" owner="FE2" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<PlaceholderPage title="Vé của tôi" owner="FE3" />} />
            <Route path="/bookings/:id" element={<PlaceholderPage title="Chi tiết vé" owner="FE3" />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="buses" element={<PlaceholderPage title="Quản lý xe" owner="FE2" />} />
            <Route path="routes" element={<PlaceholderPage title="Quản lý tuyến" owner="FE2" />} />
            <Route path="users" element={<PlaceholderPage title="Quản lý người dùng" owner="FE2" />} />
            <Route path="trips" element={<PlaceholderPage title="Quản lý chuyến" owner="FE3" />} />
            <Route path="bookings" element={<PlaceholderPage title="Quản lý vé" owner="FE3" />} />
          </Route>
        </Route>

        <Route path="*" element={<PlaceholderPage title="404 - Không tìm thấy trang" owner="nhóm" />} />
      </Routes>
    </BrowserRouter>
  );
}
