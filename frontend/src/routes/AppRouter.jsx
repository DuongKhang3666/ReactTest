import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminTripsPage from "../pages/admin/trips/AdminTripsPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/" element={<h1>Bus Ticket System</h1>}
        />

        <Route
          path="/admin/trips" element={<AdminTripsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;