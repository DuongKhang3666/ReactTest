import { useState } from "react";
import { useBuses } from "../../../hooks/useBuses";
import { useRoutes } from "../../../hooks/useRoutes";
import { useAdminTrip, useUpdateAdminTrip } from "../../../hooks/useTrips";

function EditTripForm({ tripId, onClose }) {
  const tripQuery = useAdminTrip(tripId);
  const routesQuery = useRoutes();
  const busesQuery = useBuses();
  const updateMutation = useUpdateAdminTrip(tripId);
  const [formOverride, setFormOverride] = useState(null);
  const trip = tripQuery.data;
  const form = formOverride ?? (trip ? {
      routeId: String(trip.route.id),
      busId: String(trip.bus.id),
      departureTime: trip.departureTime.slice(0, 16),
      arrivalTime: trip.arrivalTime.slice(0, 16),
      price: String(trip.price),
      status: trip.status,
      notes: trip.notes ?? "",
    } : {
      routeId: "",
      busId: "",
      departureTime: "",
      arrivalTime: "",
      price: "",
      status: "SCHEDULED",
      notes: "",
    });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormOverride((current) => ({
      ...(current ?? form),
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    updateMutation.mutate({
      route: {
        id: Number(form.routeId),
      },

      bus: {
        id: Number(form.busId),
      },

      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      price: Number(form.price),
      status: form.status,
      notes: form.notes,
    }, { onSuccess: onClose });
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

  const routes = routesQuery.data;
  const buses = busesQuery.data;

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <h2>Chỉnh sửa chuyến #{tripId}</h2>

      <div>
        <label>Route</label>

        <select
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
        <label>Bus</label>

        <select
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
        <label>Khởi hành</label>

        <input
          type="datetime-local"
          name="departureTime"
          value={form.departureTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Đến</label>

        <input
          type="datetime-local"
          name="arrivalTime"
          value={form.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Giá</label>

        <input
          type="number"
          name="price"
          min="0"
          value={form.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Trạng thái</label>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="DEPARTED">DEPARTED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div>
        <label>Ghi chú</label>

        <input
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
          Cập nhật thất bại:{" "}
          {updateMutation.error.message}
        </p>
      )}
    </form>
  );
}

export default EditTripForm;