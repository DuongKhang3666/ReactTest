// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { confirmBooking, getAdminBookings } from "../../../api/adminBookingApi";
import AdminBookingsPage from "./AdminBookingsPage";

vi.mock("../../../api/adminBookingApi", () => ({ confirmBooking: vi.fn(), getAdminBookings: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it("reading bookings does not confirm; clicking confirms and refreshes the list", async () => {
  const booking = { id: 7, bookingCode: "BK7", tripId: 42, totalAmount: 100, status: "PENDING",
    tickets: [{ id: 1, seatNumber: "A01", passengerName: "An", status: "RESERVED" }] };
  getAdminBookings.mockResolvedValue({ data: [booking] });
  confirmBooking.mockResolvedValue({ data: { ...booking, status: "CONFIRMED" } });
  render(<QueryClientProvider client={new QueryClient()}><AdminBookingsPage /></QueryClientProvider>);
  const button = await screen.findByRole("button", { name: "Xác nhận booking" });
  expect(confirmBooking).not.toHaveBeenCalled();
  getAdminBookings.mockResolvedValue({ data: [] });
  await userEvent.click(button);
  await waitFor(() => expect(confirmBooking.mock.calls[0][0]).toBe(7));
  expect(await screen.findByText("Không có booking phù hợp.")).toBeTruthy();
});
