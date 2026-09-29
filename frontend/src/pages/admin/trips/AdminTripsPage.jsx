import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  deleteAdminTrip,
  getAdminTrips,
} from "../../../api/adminTripApi";
import CreateTripForm from "./CreateTripForm";
import EditTripForm from "./EditTripForm";

function AdminTripsPage() {
  const queryClient = useQueryClient();
  const [editingTripId, setEditingTripId] = useState(null);

  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "trips"],
    queryFn: getAdminTrips,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminTrip,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "trips"],
      });
    },
  });

  if (isPending) {
    return <p>Đang tải danh sách chuyến...</p>;
  }

  if (isError) {
    return (
      <div>
        <h1>Admin Trips</h1>
        <p>Không thể tải danh sách chuyến.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  const trips = data.data;

  const handleDelete = (tripId) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa chuyến #${tripId}?`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(tripId);
  };

  return (
    <div>
      <h1>Admin Trips</h1>

      {deleteMutation.isPending && (
        <p>Đang xóa chuyến...</p>
      )}

      {deleteMutation.isError && (
        <p>
          Xóa chuyến thất bại:{" "}
          {deleteMutation.error.message}
        </p>
      )}

      <CreateTripForm />

      {editingTripId !== null && (
        <EditTripForm
          tripId={editingTripId}
          onClose={() => setEditingTripId(null)}
        />
      )}

      {trips.length === 0 ? (
        <p>Chưa có chuyến xe.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tuyến</th>
              <th>Xe</th>
              <th>Khởi hành</th>
              <th>Đến</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Note</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.id}</td>

                <td>
                  {trip.route.departureCity}
                  {" → "}
                  {trip.route.destinationCity}
                </td>

                <td>{trip.bus.licensePlate}</td>

                <td>{trip.departureTime}</td>

                <td>{trip.arrivalTime}</td>

                <td>{trip.price}</td>

                <td>{trip.status}</td>

                <td>{trip.notes}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(trip.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Xóa
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingTripId(trip.id)}
                  >
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminTripsPage;