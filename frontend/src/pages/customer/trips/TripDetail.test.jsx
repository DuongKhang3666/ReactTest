// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBooking } from "../../../api/bookingApi";
import { getTripById, getTripSeats } from "../../../api/tripApi";
import TripDetail from "./TripDetail";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../../api/bookingApi", () => ({ createBooking: vi.fn() }));
vi.mock("../../../api/tripApi", () => ({ getTripById: vi.fn(), getTripSeats: vi.fn() }));

function renderCustomerView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/trips/42"]}>
        <Routes>
          <Route path="/trips/:tripId" element={<TripDetail />} />
          <Route path="/my-bookings/:bookingId" element={<p>Chi tiết yêu cầu đã gửi</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TripDetail booking", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getTripById.mockResolvedValue({ data: { id: 42, price: 100 } });
    getTripSeats.mockResolvedValue({ data: [
      { seatId: 11, seatNumber: "A01", status: "AVAILABLE" },
      { seatId: 12, seatNumber: "A02", status: "AVAILABLE" },
    ] });
  });
  afterEach(cleanup);

  it("keeps the same seat selection local for two customers", async () => {
    const user = userEvent.setup();
    const first = within(renderCustomerView().container);
    const second = within(renderCustomerView().container);
    const firstSeat = await first.findByRole("button", { name: /A01/ });
    const secondSeat = await second.findByRole("button", { name: /A01/ });
    await user.click(firstSeat);
    await user.click(secondSeat);
    expect(firstSeat.getAttribute("aria-pressed")).toBe("true");
    expect(secondSeat.getAttribute("aria-pressed")).toBe("true");
    expect(createBooking).not.toHaveBeenCalled();
    await user.click(firstSeat);
    expect(secondSeat.getAttribute("aria-pressed")).toBe("true");
    expect(createBooking).not.toHaveBeenCalled();
  });

  it("submits only the payload and prevents repeated requests while pending", async () => {
    const user = userEvent.setup();
    let resolve;
    createBooking.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const view = renderCustomerView();
    const ui = within(view.container);
    await user.click(await ui.findByRole("button", { name: /A01/ }));
    await user.type(ui.getByLabelText("Họ tên hành khách"), "Nguyen An");
    const form = view.container.querySelector("form");
    act(() => { fireEvent.submit(form); fireEvent.submit(form); });
    expect(createBooking).toHaveBeenCalledTimes(1);
    expect(createBooking).toHaveBeenCalledWith({
      tripId: 42, seatIds: [11],
      passengers: [{ seatId: 11, passengerName: "Nguyen An", passengerPhone: null }],
    });
    expect(ui.getByRole("button", { name: "Đang gửi yêu cầu..." }).disabled).toBe(true);
    await act(async () => resolve({ data: { id: 7, status: "PENDING" } }));
    expect(await ui.findByText("Chi tiết yêu cầu đã gửi")).toBeTruthy();
  });

  it("shows conflicting seat numbers, refreshes availability and requires a new selection", async () => {
    const user = userEvent.setup();
    createBooking.mockRejectedValue({ response: { status: 409, data: { conflictSeats: [{ seatId: 11, seatNumber: "A01" }] } } });
    const ui = within(renderCustomerView().container);
    await user.click(await ui.findByRole("button", { name: /A01/ }));
    await user.type(ui.getByLabelText("Họ tên hành khách"), "Nguyen An");
    getTripSeats.mockResolvedValue({ data: [
      { seatId: 11, seatNumber: "A01", status: "BOOKED" },
      { seatId: 12, seatNumber: "A02", status: "AVAILABLE" },
    ] });
    await user.click(ui.getByRole("button", { name: "Gửi yêu cầu đặt vé" }));
    expect(await ui.findByText("Ghế xung đột: A01")).toBeTruthy();
    await waitFor(() => expect(getTripSeats).toHaveBeenCalledTimes(2));
    expect(ui.getByRole("button", { name: /A01/ }).disabled).toBe(true);
    expect(ui.getByRole("button", { name: "Gửi yêu cầu đặt vé" }).disabled).toBe(true);
    expect(createBooking).toHaveBeenCalledTimes(1);
  });
});
