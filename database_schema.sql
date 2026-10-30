
-- =============================================================
-- WEBSITE ĐẶT VÀ QUẢN LÝ VÉ XE ĐƯỜNG DÀI
-- MySQL 8.x
--
-- File này tạo database + toàn bộ bảng MVP.
-- Không chứa mật khẩu thật hoặc JWT secret.
-- =============================================================

CREATE DATABASE IF NOT EXISTS bus_ticket_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bus_ticket_db;

-- -------------------------------------------------------------
-- 1. USERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     username VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    full_name VARCHAR(120) NULL,
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email)
    ) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 2. BUSES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buses (
                                     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     license_plate VARCHAR(20) NOT NULL,
    bus_type VARCHAR(50) NOT NULL,
    seat_count INT UNSIGNED NOT NULL,
    description VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_buses_license_plate (license_plate),
    CONSTRAINT chk_buses_seat_count CHECK (seat_count > 0)
    ) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 3. ROUTES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    departure_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    departure_station VARCHAR(150) NULL,
    destination_station VARCHAR(150) NULL,
    distance_km DECIMAL(8,2) NULL,
    duration_minutes INT UNSIGNED NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_routes_unique_path (departure_city, destination_city, departure_station, destination_station),
    KEY idx_routes_departure_destination (departure_city, destination_city)
    ) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 4. TRIPS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    route_id BIGINT UNSIGNED NOT NULL,
    bus_id BIGINT UNSIGNED NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status ENUM('SCHEDULED', 'DEPARTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_trips_search (route_id, departure_time, status),
    KEY idx_trips_bus (bus_id, departure_time),
    CONSTRAINT fk_trips_route
    FOREIGN KEY (route_id) REFERENCES routes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_trips_bus
    FOREIGN KEY (bus_id) REFERENCES buses(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_trips_time
    CHECK (arrival_time > departure_time),
    CONSTRAINT chk_trips_price
    CHECK (price >= 0)
    ) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 5. SEATS
-- Seats belong to a bus. Their availability is determined per trip
-- by active tickets of that trip.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, 
    bus_id BIGINT UNSIGNED NOT NULL, 
    seat_number VARCHAR(20) NOT NULL,
    seat_type ENUM('REGULAR', 'VIP', 'WINDOW', 'AISLE') NOT NULL DEFAULT 'REGULAR',
    floor_number TINYINT UNSIGNED NOT NULL DEFAULT 1,
    seat_row INT UNSIGNED NULL,
    seat_column INT UNSIGNED NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_seats_bus_number (bus_id, seat_number),
    KEY idx_seats_bus (bus_id),
    CONSTRAINT fk_seats_bus
        FOREIGN KEY (bus_id) REFERENCES buses(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


-- -------------------------------------------------------------
-- 6. BOOKINGS
-- One booking can contain one or more tickets/seats.
-- Xóa pending_trip_id vs unique uk_bookings_user_pending_trip để bỏ giới hạn mỗi user chỉ có một booking PENDING trên một trip
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_code VARCHAR(30) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    trip_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    note VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bookings_code (booking_code),
    KEY idx_bookings_user (user_id, booked_at),
    KEY idx_bookings_trip (trip_id, status),
    CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_bookings_total
    CHECK (total_amount >= 0)
    ) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 7. TICKETS
-- A ticket links a booking, trip and seat.
--
-- RESERVED:
--   Booking đã được user submit thành công và đang chờ admin
--   xác nhận. RESERVED vẫn chiếm ghế và KHÔNG có expiry.
--
-- CONFIRMED:
--   Ticket đã được admin xác nhận và là vé chính thức.
--
-- CANCELLED:
--   Không chiếm ghế nhưng vẫn giữ lại để lưu lịch sử.
--
-- occupied_trip_id:
--   Chỉ có giá trị khi ticket đang RESERVED hoặc CONFIRMED.
--   Khi CANCELLED, giá trị trở thành NULL.
--
-- UNIQUE(occupied_trip_id, seat_id):
--   Ngăn hai ticket active cùng chiếm một seat trên cùng trip.
--   Vì MySQL cho phép nhiều NULL trong UNIQUE index, ticket
--   CANCELLED vẫn có thể được tạo lại cho cùng trip/seat.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    trip_id BIGINT UNSIGNED NOT NULL,
    seat_id BIGINT UNSIGNED NOT NULL,
    passenger_name VARCHAR(120) NOT NULL,
    passenger_phone VARCHAR(20) NULL,
    price DECIMAL(12,2) NOT NULL,
    status ENUM('RESERVED', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'RESERVED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    occupied_trip_id BIGINT UNSIGNED GENERATED ALWAYS AS
    (
        CASE WHEN status IN ('RESERVED', 'CONFIRMED')
        THEN trip_id
        ELSE NULL
        END
    ) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tickets_occupied_seat (occupied_trip_id, seat_id ),
    KEY idx_tickets_trip_seat_status (trip_id, seat_id, status),
    KEY idx_tickets_booking (booking_id),
    KEY idx_tickets_trip (trip_id, status),
    KEY idx_tickets_seat (seat_id),
    CONSTRAINT fk_tickets_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_tickets_trip_immutable
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_seat
    FOREIGN KEY (seat_id) REFERENCES seats(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_tickets_price
    CHECK (price >= 0)
    ) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- OPTIONAL DEMO MASTER DATA
-- Safe to run repeatedly because of the unique keys used below.
-- -------------------------------------------------------------

INSERT INTO buses (
    license_plate,
    bus_type,
    seat_count,
    description,
    status
)
VALUES
    (
        '51A-12345',
        'Sleeper',
        34,
        'Xe giường nằm mẫu',
        'ACTIVE'
    ),
    (
        '43B-67890',
        'Limousine',
        24,
        'Xe limousine mẫu',
        'ACTIVE'
    )
    ON DUPLICATE KEY UPDATE
                         bus_type = VALUES(bus_type),
                         seat_count = VALUES(seat_count),
                         description = VALUES(description),
                         status = VALUES(status);

INSERT INTO routes (
    departure_city,
    destination_city,
    departure_station,
    destination_station,
    distance_km,
    duration_minutes,
    status
)
VALUES
    (
        'TP.HCM',
        'Đà Nẵng',
        'Bến xe Miền Đông',
        'Bến xe Trung tâm Đà Nẵng',
        950.00,
        660,
        'ACTIVE'
    ),
    (
        'TP.HCM',
        'Quảng Ngãi',
        'Bến xe Miền Đông',
        'Bến xe Quảng Ngãi',
        820.00,
        600,
        'ACTIVE'
    )
    ON DUPLICATE KEY UPDATE
                         departure_station = VALUES(departure_station),
                         destination_station = VALUES(destination_station),
                         distance_km = VALUES(distance_km),
                         duration_minutes = VALUES(duration_minutes),
                         status = VALUES(status);

-- Create seats for the sample buses if they do not already exist.
INSERT INTO seats (
    bus_id,
    seat_number,
    seat_type,
    floor_number,
    status
)
SELECT
    b.id,
    CONCAT('A', LPAD(n.n, 2, '0')),
    'REGULAR',
    1,
    'ACTIVE'
FROM buses b
         CROSS JOIN (
    SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL
    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL
    SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL
    SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL
    SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30 UNION ALL
    SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL
    SELECT 34
) n
WHERE b.license_plate = '51A-12345'
  AND n.n <= b.seat_count
    ON DUPLICATE KEY UPDATE
                         seat_type = VALUES(seat_type),
                         status = VALUES(status);

INSERT INTO seats (
    bus_id,
    seat_number,
    seat_type,
    floor_number,
    status
)
SELECT
    b.id,
    CONCAT('A', LPAD(n.n, 2, '0')),
    'REGULAR',
    1,
    'ACTIVE'
FROM buses b
         CROSS JOIN (
    SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL
    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL
    SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL
    SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
) n
WHERE b.license_plate = '43B-67890'
  AND n.n <= b.seat_count
    ON DUPLICATE KEY UPDATE
                         seat_type = VALUES(seat_type),
                         status = VALUES(status);

-- Sample trips for demo. Adjust dates/prices as desired.
INSERT INTO trips (
    route_id,
    bus_id,
    departure_time,
    arrival_time,
    price,
    status,
    notes
)
SELECT
    r.id,
    b.id,
    '2026-10-05 07:00:00',
    '2026-10-05 18:00:00',
    350000,
    'SCHEDULED',
    'Demo trip'
FROM routes r
         JOIN buses b
              ON b.license_plate = '51A-12345'
WHERE r.departure_city = 'TP.HCM'
  AND r.destination_city = 'Đà Nẵng'
  AND NOT EXISTS (
    SELECT 1
    FROM trips t
    WHERE t.route_id = r.id
      AND t.bus_id = b.id
      AND t.departure_time = '2026-10-05 07:00:00'
);

INSERT INTO trips (
    route_id,
    bus_id,
    departure_time,
    arrival_time,
    price,
    status,
    notes
)
SELECT
    r.id,
    b.id,
    '2026-10-05 20:00:00',
    '2026-10-06 06:00:00',
    300000,
    'SCHEDULED',
    'Demo trip'
FROM routes r
         JOIN buses b
              ON b.license_plate = '43B-67890'
WHERE r.departure_city = 'TP.HCM'
  AND r.destination_city = 'Quảng Ngãi'
  AND NOT EXISTS (
    SELECT 1
    FROM trips t
    WHERE t.route_id = r.id
      AND t.bus_id = b.id
      AND t.departure_time = '2026-10-05 20:00:00'
);

-- 1. TP.HCM -> Đà Nẵng
INSERT INTO trips (
    route_id,
    bus_id,
    departure_time,
    arrival_time,
    price,
    status,
    notes
)
SELECT
    r.id,
    b.id,
    '2027-06-05 07:00:00',
    '2027-06-05 18:00:00',
    350000,
    'SCHEDULED',
    'Demo trip - June 2027'
FROM routes r
         JOIN buses b
              ON b.license_plate = '51A-12345'
WHERE r.departure_city = 'TP.HCM'
  AND r.destination_city = 'Đà Nẵng'
  AND NOT EXISTS (
    SELECT 1
    FROM trips t
    WHERE t.route_id = r.id
      AND t.bus_id = b.id
      AND t.departure_time = '2027-06-05 07:00:00'
);


-- 2. TP.HCM -> Quảng Ngãi
INSERT INTO trips (
    route_id,
    bus_id,
    departure_time,
    arrival_time,
    price,
    status,
    notes
)
SELECT
    r.id,
    b.id,
    '2027-06-12 20:00:00',
    '2027-06-13 06:00:00',
    300000,
    'SCHEDULED',
    'Demo trip - June 2027'
FROM routes r
         JOIN buses b
              ON b.license_plate = '43B-67890'
WHERE r.departure_city = 'TP.HCM'
  AND r.destination_city = 'Quảng Ngãi'
  AND NOT EXISTS (
    SELECT 1
    FROM trips t
    WHERE t.route_id = r.id
      AND t.bus_id = b.id
      AND t.departure_time = '2027-06-12 20:00:00'
);


-- 3. TP.HCM -> Đà Nẵng
INSERT INTO trips (
    route_id,
    bus_id,
    departure_time,
    arrival_time,
    price,
    status,
    notes
)
SELECT
    r.id,
    b.id,
    '2027-06-20 20:00:00',
    '2027-06-21 07:00:00',
    400000,
    'SCHEDULED',
    'Demo trip - June 2027'
FROM routes r
         JOIN buses b
              ON b.license_plate = '51A-12345'
WHERE r.departure_city = 'TP.HCM'
  AND r.destination_city = 'Đà Nẵng'
  AND NOT EXISTS (
    SELECT 1
    FROM trips t
    WHERE t.route_id = r.id
      AND t.bus_id = b.id
      AND t.departure_time = '2027-06-20 20:00:00'
);

-- =============================================================
-- Notes:
-- 1. User passwords must be stored as BCrypt/Argon2 hashes by
--    Spring Security.
-- 2. JWT secrets must be configured through environment
--    variables/local config.
-- 3. Backend must validate that a seat belongs to the trip's
--    bus before creating a ticket. The SQL schema cannot enforce
--    that cross-table rule.
-- 4. A RESERVED or CONFIRMED ticket occupies a seat.
-- 5. A CANCELLED ticket does not occupy a seat and remains as
--    history.
-- 6. The backend must use transactions/locking for booking,
--    cancellation and admin confirmation.
-- =============================================================
