import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminTripsPage from "../pages/admin/trips/AdminTripsPage";
import TripDetailsPage from "../pages/customer/trips/TripDetailsPage.jsx";
import BookingDetailPage from "../pages/customer/bookings/BookingDetailPage";
import MyBookingsPage from "../pages/customer/bookings/MyBookingsPage";
import BookingPage from "../pages/customer/bookings/BookingPage";
import SeatSelectPage from "../pages/customer/seats/SeatSelectPage.jsx";
import AdminLayout from "../layouts/Admin/AdminLayout";
import VehiclesPage from "../pages/admin/vihicle/VehiclesPage.jsx";
import RoutesPage from "../pages/admin/routes/RoutesPage.jsx";
import UsersPage from "../pages/admin/personal/UsersPage.jsx";

// ---- FE1: đăng nhập/đăng ký, trang chủ, tìm chuyến, hồ sơ, dashboard ----
import { AuthProvider } from "../contexts/AuthContext";
import MainLayout from "../layouts/MainLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";
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
          {/* FE1: các trang dùng khung MainLayout (menu + chân trang) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/trips" element={<SearchTrips />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="/trips/:tripId" element={<TripDetailsPage />} />
          <Route path="/trips/:tripId/seats" element={<SeatSelectPage />} />

          <Route element={<ProtectedRoute role="CUSTOMER" />}>
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route
              path="/my-bookings/:bookingId"
              element={<BookingDetailPage />}
            />
          </Route>

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="trips" element={<AdminTripsPage />} />
            </Route>
          </Route>

          <Route element={<MainLayout />}>
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="404 - Không tìm thấy trang"
                  owner="nhóm"
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
