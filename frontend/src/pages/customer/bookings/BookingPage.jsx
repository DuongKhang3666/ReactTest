import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { getTripById } from "../../../api/tripApi";

import "./BookingPage.css";

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const selection = location.state;

  const [passengers, setPassengers] = useState(() => {
    if (!selection?.selectedSeatIds) {
      return [];
    }

    return selection.selectedSeatIds.map((seatId) => ({
      seatId,
      passengerName: "",
      passengerPhone: "",
    }));
  });

  const tripId = selection?.tripId;
  const selectedSeatIds = selection?.selectedSeatIds;

  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripById(tripId),
    enabled: Boolean(tripId),
  });

  if (!tripId || !Array.isArray(selectedSeatIds)) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h1>Không có thông tin đặt vé</h1>

          <p>
            Vui lòng chọn ghế từ trang chi tiết chuyến xe.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (selectedSeatIds.length === 0) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h1>Chưa chọn ghế</h1>

          <p>
            Vui lòng quay lại và chọn ít nhất một ghế.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (tripQuery.isPending) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          Đang tải thông tin chuyến xe...
        </div>
      </div>
    );
  }

  if (tripQuery.isError) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h1>Không thể tải chuyến xe</h1>

          <p>{tripQuery.error?.message}</p>
        </div>
      </div>
    );
  }

  const trip = tripQuery.data.data;

  const updatePassenger = (
    index,
    field,
    value,
  ) => {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) => {
        if (passengerIndex !== index) {
          return passenger;
        }

        return {
          ...passenger,
          [field]: value,
        };
      }),
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Booking draft:", {
      tripId,
      selectedSeatIds,
      passengers,
    });

    alert(
      "Thông tin booking đã sẵn sàng. Chờ API Booking từ BE2.",
    );
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <span>ĐẶT VÉ</span>

          <h1>Thông tin đặt vé</h1>

          <p>
            Kiểm tra chuyến xe và nhập thông tin hành khách.
          </p>
        </div>

        <div className="booking-layout">
          {/* Trip summary */}
          <section className="booking-card trip-summary">
            <h2>Thông tin chuyến xe</h2>

            <div className="route-summary">
              <div>
                <span>Điểm đi</span>
                <strong>
                  {trip.route?.departureCity}
                </strong>
              </div>

              <div className="route-arrow">
                →
              </div>

              <div>
                <span>Điểm đến</span>
                <strong>
                  {trip.route?.destinationCity}
                </strong>
              </div>
            </div>

            <div className="trip-info-grid">
              <div>
                <span>Xe</span>
                <strong>
                  {trip.bus?.licensePlate}
                </strong>
              </div>

              <div>
                <span>Loại xe</span>
                <strong>
                  {trip.bus?.busType}
                </strong>
              </div>

              <div>
                <span>Khởi hành</span>
                <strong>
                  {trip.departureTime}
                </strong>
              </div>

              <div>
                <span>Đến</span>
                <strong>
                  {trip.arrivalTime}
                </strong>
              </div>

              <div>
                <span>Giá / ghế</span>
                <strong>
                  {Number(trip.price).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  ₫
                </strong>
              </div>

              <div>
                <span>Số ghế đã chọn</span>
                <strong>
                  {selectedSeatIds.length}
                </strong>
              </div>
            </div>

            <div className="selected-seats">
              <span>Seat ID đã chọn</span>

              <div className="seat-tags">
                {selectedSeatIds.map((seatId) => (
                  <span key={seatId}>
                    #{seatId}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Passenger form */}
          <section className="booking-card">
            <div className="section-heading">
              <div>
                <h2>Thông tin hành khách</h2>

                <p>
                  Mỗi ghế tương ứng với một hành khách.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="passenger-list">
                {passengers.map(
                  (passenger, index) => (
                    <div
                      className="passenger-card"
                      key={passenger.seatId}
                    >
                      <div className="passenger-title">
                        <strong>
                          Hành khách {index + 1}
                        </strong>

                        <span>
                          Ghế #{passenger.seatId}
                        </span>
                      </div>

                      <div className="field-grid">
                        <label>
                          Họ và tên

                          <input
                            type="text"
                            value={
                              passenger.passengerName
                            }
                            onChange={(event) =>
                              updatePassenger(
                                index,
                                "passengerName",
                                event.target.value,
                              )
                            }
                            placeholder="Nguyễn Văn A"
                            required
                          />
                        </label>

                        <label>
                          Số điện thoại

                          <input
                            type="tel"
                            value={
                              passenger.passengerPhone
                            }
                            onChange={(event) =>
                              updatePassenger(
                                index,
                                "passengerPhone",
                                event.target.value,
                              )
                            }
                            placeholder="09xxxxxxxx"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="booking-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Tiếp tục đặt vé
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;