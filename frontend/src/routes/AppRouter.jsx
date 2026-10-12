import { BrowserRouter, Route, Routes } from "react-router-dom";

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

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TripDetailsPage />} />
                <Route path="/trips/:tripId" element={<TripDetailsPage />} />
                <Route path="/trips/:tripId/seats" element={<SeatSelectPage />} />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="routes" element={<RoutesPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="trips" element={<AdminTripsPage />} />
                </Route>

                <Route element={<ProtectedRoute role="CUSTOMER" />}>
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />
                </Route>

                <Route element={<ProtectedRoute role="ADMIN" />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="vehicles" element={<VehiclesPage />} />
                        <Route path="routes" element={<RoutesPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="trips" element={<AdminTripsPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
