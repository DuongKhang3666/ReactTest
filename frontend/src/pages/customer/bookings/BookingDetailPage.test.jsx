// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { getBookingById } from "../../../api/bookingApi";
import BookingDetailPage from "./BookingDetailPage";

vi.mock("../../../api/bookingApi", () => ({ getBookingById: vi.fn(), cancelTicket: vi.fn(), cancelBooking: vi.fn() }));
afterEach(cleanup);

it.each(["PENDING", "CONFIRMED", "CANCELLED"])("shows official tickets only when confirmed: %s", async (status) => {
  getBookingById.mockResolvedValue({ data: { id: 7, bookingCode: "BK7", status, totalAmount: 100,
    tickets: [{ id: 1, seatNumber: "A01", passengerName: "An", price: 100, status: status === "PENDING" ? "RESERVED" : status }] } });
  render(<QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={["/my-bookings/7"]}><Routes>
      <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />
    </Routes></MemoryRouter>
  </QueryClientProvider>);
  await screen.findByText(/Mã booking: BK7/);
  expect(screen.queryByText(/Vé chính thức ·/)!==null).toBe(status === "CONFIRMED");
  expect(screen.queryByRole("status")!==null).toBe(status === "PENDING");
});
