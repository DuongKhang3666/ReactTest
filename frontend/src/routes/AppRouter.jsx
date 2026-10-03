import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminBookingsPage from "../pages/admin/bookings/AdminBookingsPage";
import AdminTripsPage from "../pages/admin/trips/AdminTripsPage";
import MyBookingsPage from "../pages/customer/bookings/MyBookingsPage";
import BookingDetailPage from "../pages/customer/bookings/BookingDetailPage";
import TripDetail from "../pages/customer/trips/TripDetail";
// import TicketsDetailPage from "../pages/customer/tickets/TicketsDetailPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
         <Route path="/" element={<h1>Bus Ticket System</h1>} />
        {/*<Route path="/" element={<TicketsDetailPage />} />*/}

        {/* Customer */}
        <Route element={<ProtectedRoute role="CUSTOMER"/>} >
          <Route path="/trips/:tripId" element={<TripDetail />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/trips" element={<AdminTripsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;