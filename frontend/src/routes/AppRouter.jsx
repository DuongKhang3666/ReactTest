import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminTripsPage from "../pages/admin/trips/AdminTripsPage";
import MyBookingsPage from "../pages/customer/bookings/MyBookingsPage";
import BookingDetailPage from "../pages/customer/bookings/BookingDetailPage";
import BookingPage from "../pages/customer/bookings/BookingPage";
import SeatsPage from "../pages/customer/seats/SeatsPage";
import AdminLayout from "../layouts/Admin/AdminLayout";
import VehiclesPage from "../pages/admin/vihicle/VehiclesPage.jsx";
import RoutesPage from "../pages/admin/routes/RoutesPage.jsx";
// import UsersPage from "../pages/admin/personal/UsersPage.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                {/* <Route path="/" element={<h1>Bus Ticket System</h1>} /> */}
                <Route path = "/" element={<AdminLayout />}>
                    <Route path="admin/vehicles" element={<VehiclesPage />} />
                    <Route path="admin/routes" element={<RoutesPage />} />
                    {/* <Route path="admin/users" element={<UsersPage />} /> */}
                </Route>
              
                {/* Customer */}
                <Route element={<ProtectedRoute role="CUSTOMER"/>} >
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />
                    <Route path="/seats" element={<SeatsPage />} />
                </Route>

                {/* Admin */}
                {/* <Route element={<ProtectedRoute role="ADMIN" />}>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route path="vehicles" element={<VehiclesPage />} />
                        <Route path="routes" element={<RoutesPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="trips" element={<AdminTripsPage />} />
                    </Route>
                </Route>     */}
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;