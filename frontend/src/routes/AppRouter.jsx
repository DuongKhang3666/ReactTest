import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminTripsPage from "../pages/admin/trips/AdminTripsPage";
import TripDetailsPage from "../pages/customer/trips/TripDetailsPage.jsx";
import BookingDetailPage from "../pages/customer/bookings/BookingDetailPage";
import MyBookingsPage from "../pages/customer/bookings/MyBookingsPage";
import AdminBookingsPage from "../pages/admin/bookings/AdminBookingsPage";
import BookingPage from "../pages/customer/bookings/BookingPage";
import SeatSelectPage from "../pages/customer/seats/SeatSelectPage.jsx";
import AdminLayout from "../layouts/Admin/AdminLayout";
import VehiclesPage from "../pages/admin/vihicle/VehiclesPage.jsx";
import RoutesPage from "../pages/admin/routes/RoutesPage.jsx";
import UsersPage from "../pages/admin/personal/UsersPage.jsx";

// ---- FE1: đăng nhập/đăng ký, trang chủ, tìm chuyến, hồ sơ, dashboard ----
import { AuthProvider } from "../contexts/AuthContext";
import MainLayout from "../layouts/MainLayout";
import Fe1Scope from "../layouts/Fe1Scope";
import NotFound from "../pages/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/customer/Home";
import SearchTrips from "../pages/customer/SearchTrips";
import Profile from "../pages/customer/Profile";
import Dashboard from "../pages/admin/Dashboard";

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Khu khách hàng: tất cả dùng chung khung có menu (MainLayout) */}
          <Route element={<MainLayout />}>
            {/* FE1 */}
            <Route element={<Fe1Scope />}>
              <Route path="/" element={<Home />} />
              <Route path="/trips" element={<SearchTrips />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* FE2: chi tiết chuyến, chọn ghế (không cần đăng nhập để xem) */}
            <Route path="/trips/:tripId" element={<TripDetailsPage />} />
            <Route path="/trips/:tripId/seats" element={<SeatSelectPage />} />

            {/* FE2/FE3: đặt vé và vé của tôi (cần đăng nhập khách hàng) */}
            <Route element={<ProtectedRoute role="CUSTOMER" />}>
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route
                path="/my-bookings/:bookingId"
                element={<BookingDetailPage />}
              />
            </Route>

            <Route element={<Fe1Scope />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>

          {/* Khu quản trị (cần quyền ADMIN) */}
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="trips" element={<AdminTripsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
