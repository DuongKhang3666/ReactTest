import { useState } from "react";
import { useBuses } from "../../../hooks/useBuses";
import { useRoutes } from "../../../hooks/useRoutes";
import { useAdminTrip, useUpdateAdminTrip } from "../../../hooks/useTrips";

const initialForm = {
  routeId: "",
  busId: "",
  departureTime: "",
  arrivalTime: "",
  price: "",
  status: "SCHEDULED",
  notes: "",
};

const MAX_PRICE = 9999999999.99;

function toLocalDateTimeValue(date) {
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function EditTripForm({ tripId, onClose, today }) {
  const tripQuery = useAdminTrip(tripId);
  const routesQuery = useRoutes();
  const busesQuery = useBuses();
  const updateMutation = useUpdateAdminTrip(tripId);

  const [formOverride, setFormOverride] = useState(null);

  const trip = tripQuery.data;

  const form =
    formOverride ??
    (trip
      ? {
          routeId: String(trip.route.id),
          busId: String(trip.bus.id),
          departureTime: trip.departureTime.slice(0, 16),
          arrivalTime: trip.arrivalTime.slice(0, 16),
          price: String(trip.price),
          status: trip.status,
          notes: trip.notes ?? "",
        }
      : initialForm);

  const routes = routesQuery.data ?? [];
  const buses = busesQuery.data ?? [];

  const selectedRoute = routes.find(
    (route) => route.id === Number(form.routeId),
  );

  const durationMinutes = Number(selectedRoute?.durationMinutes);

  // Tính thời điểm đến sớm nhất được phép.
  const minArrivalTime = (() => {
    if (
      !form.departureTime ||
      !selectedRoute ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 0
    ) {
      return form.departureTime || today;
    }

    const departure = new Date(form.departureTime);

    departure.setMinutes(
      departure.getMinutes() + durationMinutes,
    );

    return toLocalDateTimeValue(departure);
  })();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormOverride((current) => ({
      ...form,
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const departure = new Date(form.departureTime);
    const arrival = new Date(form.arrivalTime);
    const price = Number(form.price);

    if (
      !form.routeId ||
      !selectedRoute ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 0
    ) {
      alert("Vui lòng chọn route hợp lệ có thời gian di chuyển.");
      return;
    }

    if (
      !form.departureTime ||
      Number.isNaN(departure.getTime())
    ) {
      alert("Vui lòng nhập thời gian khởi hành hợp lệ.");
      return;
    }

    if (departure < new Date()) {
      alert("Thời gian khởi hành không được ở trong quá khứ.");
      return;
    }

    if (
      !form.arrivalTime ||
      Number.isNaN(arrival.getTime())
    ) {
      alert("Vui lòng nhập thời gian đến hợp lệ.");
      return;
    }

    const earliestArrival = new Date(
      departure.getTime() + durationMinutes * 60 * 1000,
    );

    if (arrival < earliestArrival) {
      alert(
        `Thời gian đến phải muộn hơn hoặc bằng thời gian khởi hành cộng ${durationMinutes} phút.`,
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      price > MAX_PRICE ||
      !/^\d+(\.\d{1,2})?$/.test(form.price)
    ) {
      alert(
        "Giá vé phải từ 0 đến 9.999.999.999,99 và tối đa 2 chữ số thập phân.",
      );
      return;
    }

    if (!form.busId) {
      alert("Vui lòng chọn xe.");
      return;
    }

    updateMutation.mutate(
      {
        route: {
          id: Number(form.routeId),
        },
        bus: {
          id: Number(form.busId),
        },
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        price,
        status: form.status,
        notes: form.notes,
      },
      {
        onSuccess: onClose,
      },
    );
  };

  if (
    tripQuery.isPending ||
    routesQuery.isPending ||
    busesQuery.isPending
  ) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (
    tripQuery.isError ||
    routesQuery.isError ||
    busesQuery.isError
  ) {
    return <p>Không thể tải dữ liệu Trip.</p>;
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <h2>Chỉnh sửa chuyến #{tripId}</h2>

      <div>
        <label htmlFor="routeId">Route</label>

        <select
          id="routeId"
          name="routeId"
          value={form.routeId}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn Route --</option>

          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.departureCity} → {route.destinationCity}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="busId">Bus</label>

        <select
          id="busId"
          name="busId"
          value={form.busId}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn Bus --</option>

          {buses.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.licensePlate} - {bus.busType}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="departureTime">Khởi hành</label>

        <input
          id="departureTime"
          type="datetime-local"
          name="departureTime"
          value={form.departureTime}
          onChange={handleChange}
          min={today}
          required
        />
      </div>

      <div>
        <label htmlFor="arrivalTime">Đến</label>

        <input
          id="arrivalTime"
          type="datetime-local"
          name="arrivalTime"
          value={form.arrivalTime}
          onChange={handleChange}
          min={minArrivalTime}
          required
        />

        {selectedRoute &&
          Number.isFinite(durationMinutes) &&
          durationMinutes >= 0 && (
            <small>
              Thời gian di chuyển: {durationMinutes} phút.
              Thời gian đến sớm nhất được phép được tính tự động.
            </small>
          )}
      </div>

      <div>
        <label htmlFor="price">Giá</label>

        <input
          id="price"
          type="number"
          name="price"
          min="0"
          max="9999999999.99"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="status">Trạng thái</label>

        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
            <option value="SCHEDULED">Đã lên lịch</option>
            <option value="DEPARTED">Đã khởi hành</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes">Ghi chú</label>

        <input
          id="notes"
          type="text"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending
          ? "Đang lưu..."
          : "Lưu thay đổi"}
      </button>

      <button
        type="button"
        onClick={onClose}
        disabled={updateMutation.isPending}
      >
        Hủy
      </button>

      {updateMutation.isError && (
        <p>
          Cập nhật thất bại: {updateMutation.error.message}
        </p>
      )}
    </form>
  );
}

export default EditTripForm;
