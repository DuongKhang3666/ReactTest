import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createAdminTrip } from "../../../api/adminTripApi";
import { getAdminBuses } from "../../../api/adminBusApi";
import { getAdminRoutes } from "../../../api/adminRouteApi";

function CreateTripForm({ onClose }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    routeId: "",
    busId: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    status: "SCHEDULED",
    notes: "",
  });

  const routesQuery = useQuery({
    queryKey: ["admin", "routes"],
    queryFn: getAdminRoutes,
  });

  const busesQuery = useQuery({
    queryKey: ["admin", "buses"],
    queryFn: getAdminBuses,
  });

  const createMutation = useMutation({
    mutationFn: createAdminTrip,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "trips"],
      });

      setForm({
        routeId: "",
        busId: "",
        departureTime: "",
        arrivalTime: "",
        price: "",
        status: "SCHEDULED",
        notes: "",
      });

      onClose();
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    createMutation.mutate({
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
    });
  };

  if (routesQuery.isPending || busesQuery.isPending) {
    return <p>Đang tải Route và Bus...</p>;
  }

  if (routesQuery.isError || busesQuery.isError) {
    return <p>Không thể tải dữ liệu Route hoặc Bus.</p>;
  }

  const routes = routesQuery.data.data;
  const buses = busesQuery.data.data;

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <h2>Tạo chuyến xe</h2>

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
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? "Đang tạo..." : "Tạo chuyến"}
      </button>

      {createMutation.isError && (
        <p>Tạo chuyến thất bại: {createMutation.error.message}</p>
      )}

      {createMutation.isSuccess && (
        <p>Tạo chuyến thành công.</p>
      )}
    </form>
  );
}

export default CreateTripForm;