import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminTripsPage from "../pages/admin/trips/AdminTripsPage";
import AdminBookingsPage from "../pages/admin/bookings/AdminBookingsPage";

import MyBookingsPage from "../pages/customer/bookings/MyBookingsPage";
import BookingDetailPage from "../pages/customer/bookings/BookingDetailPage";
import BookingPage from "../pages/customer/bookings/BookingPage";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<h1>Bus Ticket System</h1>} />

                {/* Customer */}
                <Route element={<ProtectedRoute role="CUSTOMER"/>} >
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />
                </Route>

                {/* Admin */}
                <Route element={<ProtectedRoute role="ADMIN" />}>
                    <Route path="/admin/trips" element={<AdminTripsPage />} />
                    <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;