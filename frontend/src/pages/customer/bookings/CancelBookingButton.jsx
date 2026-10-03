import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBooking } from "../../../api/bookingApi";

function CancelBookingButton({ bookingId }) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(bookingId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-seats"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "me"],
      });

      queryClient.invalidateQueries({
        queryKey: ["booking", String(bookingId)],
      });
    },
  });

  const handleCancel = () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn hủy booking này?"
    );

    if (!confirmed) {
      return;
    }

    cancelMutation.mutate();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={cancelMutation.isPending}
      >
        {cancelMutation.isPending
          ? "Đang hủy..."
          : "Hủy booking"}
      </button>

      {cancelMutation.isError && (
        <p>
          Hủy booking thất bại:{" "}
          {cancelMutation.error.response?.data?.message ?? cancelMutation.error.message}
        </p>
      )}

      {cancelMutation.isSuccess && (
        <p>Đã hủy booking thành công.</p>
      )}
    </div>
  );
}

export default CancelBookingButton;