package com.example.backend.service;

import com.example.backend.dto.booking.CreateBookingRequest;
import com.example.backend.dto.booking.PassengerDetails;
import com.example.backend.entity.Booking;
import com.example.backend.enums.TicketStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.entity.User;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JwtService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.show-sql=false"
})
@Testcontainers
class BookingServiceTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
            .withDatabaseName("bus_ticket_db")
            .withCopyFileToContainer(org.testcontainers.utility.MountableFile.forHostPath(
                    java.nio.file.Path.of("../database_schema.sql").toAbsolutePath()),
                    "/docker-entrypoint-initdb.d/baseline.sql")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired
    private BookingService bookingService;
    @Autowired
    private TripService tripService;
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;
    @Autowired
    private BookingRepository bookingRepository;
    @org.springframework.test.context.bean.override.mockito.MockitoSpyBean
    private TicketRepository ticketRepository;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private ObjectMapper objectMapper;
    @LocalServerPort
    private int port;

    private Long firstUser;
    private Long secondUser;
    private Long tripId;
    private Long firstSeatId;
    private Long secondSeatId;

    @BeforeEach
    void prepareDatabase() throws Exception {
        jdbc.update("DELETE FROM tickets");
        jdbc.update("DELETE FROM bookings");
        jdbc.update("DELETE FROM seats");
        jdbc.update("DELETE FROM trips");
        jdbc.update("DELETE FROM buses");
        jdbc.update("DELETE FROM routes");
        jdbc.update("DELETE FROM users");

        firstUser = insertUser("first");
        secondUser = insertUser("second");
        jdbc.update("""
                INSERT INTO routes (departure_city, destination_city, status, created_at, updated_at)
                VALUES ('A', 'B', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """);
        Long routeId = jdbc.queryForObject("SELECT id FROM routes WHERE departure_city = 'A'", Long.class);
        jdbc.update("""
                INSERT INTO buses (license_plate, bus_type, seat_count, status, created_at, updated_at)
                VALUES ('TEST-1', 'Coach', 2, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """);
        Long busId = jdbc.queryForObject("SELECT id FROM buses WHERE license_plate = 'TEST-1'", Long.class);
        jdbc.update("""
                INSERT INTO trips
                    (route_id, bus_id, departure_time, arrival_time, price, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 125.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, routeId, busId, LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(4));
        tripId = jdbc.queryForObject("SELECT id FROM trips WHERE bus_id = ?", Long.class, busId);
        jdbc.update("""
                INSERT INTO seats (bus_id, seat_number, seat_type, floor_number, status, created_at)
                VALUES (?, 'A01', 'REGULAR', 1, 'ACTIVE', CURRENT_TIMESTAMP),
                       (?, 'A02', 'REGULAR', 1, 'ACTIVE', CURRENT_TIMESTAMP)
                """, busId, busId);
        firstSeatId = seatId("A01");
        secondSeatId = seatId("A02");
    }

    @Test
    void submitCreatesOneReservedBookingWithOneTicketPerSeat() throws Exception {
        HttpResponse<String> response = send("POST", "/api/bookings", firstUser,
                requestBody(List.of(firstSeatId, secondSeatId)));
        JsonNode body = objectMapper.readTree(response.body());
        assertEquals(201, response.statusCode());
        assertEquals("PENDING", body.path("status").asText());
        assertEquals(2, body.path("tickets").size());

        assertEquals(1, bookingRepository.count());
        assertEquals(2, ticketRepository.count());
        assertEquals(new BigDecimal("250.00"), bookingRepository.findAll().get(0).getTotalAmount());
        assertEquals(2, jdbc.queryForObject(
                "SELECT COUNT(*) FROM tickets WHERE status = 'RESERVED' AND trip_id = ?",
                Integer.class, tripId));
    }

    @Test
    void occupiedSeatReturnsHttp409AndRollsBackEverySeatInMultiSeatRequest() throws Exception {
        create(firstUser, List.of(secondSeatId));

        HttpResponse<String> response = send("POST", "/api/bookings", secondUser,
                requestBody(List.of(firstSeatId, secondSeatId)));
        JsonNode body = objectMapper.readTree(response.body());
        assertEquals(409, response.statusCode());
        assertEquals("A02", body.path("conflictSeats").get(0).path("seatNumber").asText());
        assertEquals(1, body.path("conflictSeats").size());
        assertEquals(secondSeatId, body.path("conflictSeats").get(0).path("seatId").asLong());

        assertEquals(1, bookingRepository.count());
        assertEquals(1, ticketRepository.count());
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM tickets WHERE seat_id = ? AND status = 'RESERVED'",
                Integer.class, firstSeatId));
    }

    @Test
    void simultaneousUsersCannotBookTheSameSeat() throws Exception {
        List<HttpResponse<String>> responses = runHttpTogether(
                httpCall(firstUser, List.of(firstSeatId)),
                httpCall(secondUser, List.of(firstSeatId))
        );

        assertEquals(1, responses.stream().filter(response -> response.statusCode() == 201).count());
        assertEquals(1, responses.stream().filter(response -> response.statusCode() == 409).count());
        JsonNode conflict = responses.stream()
                .filter(response -> response.statusCode() == 409)
                .map(response -> readJson(response.body()))
                .findFirst()
                .orElseThrow();
        assertEquals(firstSeatId, conflict.path("conflictSeats").get(0).path("seatId").asLong());
        assertEquals(1, bookingRepository.count());
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM tickets WHERE trip_id = ? AND seat_id = ? AND status = 'RESERVED'",
                Integer.class, tripId, firstSeatId));
    }

    @Test
    void sortedSeatLocksHandleOverlappingRequestsInOppositeOrder() throws Exception {
        List<HttpResponse<String>> responses = runHttpTogether(
                httpCall(firstUser, List.of(firstSeatId, secondSeatId)),
                httpCall(secondUser, List.of(secondSeatId, firstSeatId))
        );

        assertEquals(1, responses.stream().filter(response -> response.statusCode() == 201).count());
        assertEquals(1, responses.stream().filter(response -> response.statusCode() == 409).count());
        assertEquals(1, bookingRepository.count());
        assertEquals(2, ticketRepository.count());
    }

    @Test
    void cancelledTicketCanBeRebookedAndHistoryRemains() throws Exception {
        Booking original = create(firstUser, List.of(firstSeatId));
        Long ticketId = ticketRepository.findByBookingIdOrderById(original.getId()).get(0).getId();

        assertEquals(200, send("PATCH", "/api/bookings/" + original.getId() + "/tickets/" + ticketId + "/cancel",
                firstUser, null).statusCode());
        create(secondUser, List.of(firstSeatId));

        assertEquals(2, bookingRepository.count());
        assertEquals(2, ticketRepository.count());
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM tickets WHERE trip_id = ? AND seat_id = ? AND status = 'CANCELLED'",
                Integer.class, tripId, firstSeatId));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM tickets WHERE trip_id = ? AND seat_id = ? AND status = 'RESERVED'",
                Integer.class, tripId, firstSeatId));
    }

    @Test
    void cancellingBookingMakesAllSeatsAvailable() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        assertEquals(200, send("PATCH", "/api/bookings/" + booking.getId() + "/cancel",
                firstUser, null).statusCode());

        List<Long> confirmedSeatIds = jdbc.queryForList(
                "SELECT seat_id FROM tickets WHERE trip_id = ? AND status = 'RESERVED'",
                Long.class, tripId);
        assertEquals(0, confirmedSeatIds.size());
        assertEquals(2, jdbc.queryForObject(
                "SELECT COUNT(*) FROM tickets WHERE booking_id = ? AND status = 'CANCELLED'",
                Integer.class, booking.getId()));
        create(secondUser, List.of(firstSeatId, secondSeatId));
        assertEquals(2, bookingRepository.count());
    }

    @Test
    void anotherUserCannotViewOrCancelABooking() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId));
        assertEquals(403, send("GET", "/api/bookings/" + booking.getId(), secondUser, null).statusCode());
        assertEquals(403, send("PATCH", "/api/bookings/" + booking.getId() + "/cancel",
                secondUser, null).statusCode());

        assertEquals(TicketStatus.RESERVED,
                ticketRepository.findByBookingIdOrderById(booking.getId()).get(0).getStatus());
    }

    @Test
    void duplicateSeatIdsAreRejected() {
        CreateBookingRequest duplicated = request(List.of(firstSeatId, firstSeatId));
        assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(firstUser, duplicated));
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void adminConfirmsRemainingTicketsAndRepeatedConfirmationDoesNotChangeData() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        Long ticketId = ticketRepository.findByBookingIdOrderById(booking.getId()).get(0).getId();
        bookingService.cancelTicket(firstUser, booking.getId(), ticketId);
        assertEquals("PENDING", bookingRepository.findById(booking.getId()).orElseThrow().getStatus().name());
        assertEquals(403, send("POST", "/api/admin/bookings/" + booking.getId() + "/confirm", firstUser, null).statusCode());
        jdbc.update("UPDATE users SET role = 'ADMIN' WHERE id = ?", secondUser);
        assertEquals(1, readJson(send("GET", "/api/admin/bookings?status=PENDING", secondUser, null).body()).size());
        for (int i = 0; i < 2; i++) {
            HttpResponse<String> confirmed = send("POST", "/api/admin/bookings/" + booking.getId() + "/confirm", secondUser, null);
            assertEquals(200, confirmed.statusCode());
            assertEquals("CONFIRMED", readJson(confirmed.body()).path("status").asText());
        }
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status = 'CONFIRMED'", Integer.class));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status = 'CANCELLED'", Integer.class));
        bookingService.cancelBooking(firstUser, booking.getId());
        assertEquals(400, send("POST", "/api/admin/bookings/" + booking.getId() + "/confirm", secondUser, null).statusCode());
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status = 'CANCELLED'", Integer.class));
    }

    @Test
    void simultaneousConfirmAndTicketCancelNeverRestoreCancelledTicket() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        Long ticketId = ticketRepository.findByBookingIdOrderById(booking.getId()).get(0).getId();
        jdbc.update("UPDATE users SET role = 'ADMIN' WHERE id = ?", secondUser);
        List<HttpResponse<String>> responses = runHttpTogether(
                () -> send("POST", "/api/admin/bookings/" + booking.getId() + "/confirm", secondUser, null),
                () -> send("PATCH", "/api/bookings/" + booking.getId() + "/tickets/" + ticketId + "/cancel", firstUser, null));
        assertEquals(List.of(200, 200), responses.stream().map(HttpResponse::statusCode).toList());
        assertEquals("CONFIRMED", bookingRepository.findById(booking.getId()).orElseThrow().getStatus().name());
        assertEquals(TicketStatus.CANCELLED, ticketRepository.findById(ticketId).orElseThrow().getStatus());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status = 'CONFIRMED'", Integer.class));
        assertEquals(new BigDecimal("125.00"), bookingRepository.findById(booking.getId()).orElseThrow().getTotalAmount());
    }

    @Test
    void simultaneousConfirmAndWholeCancellationEndCancelled() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        jdbc.update("UPDATE users SET role = 'ADMIN' WHERE id = ?", secondUser);
        List<HttpResponse<String>> responses = runHttpTogether(
                () -> send("POST", "/api/admin/bookings/" + booking.getId() + "/confirm", secondUser, null),
                () -> send("PATCH", "/api/bookings/" + booking.getId() + "/cancel", firstUser, null));
        org.junit.jupiter.api.Assertions.assertTrue(List.of(200, 400).contains(responses.get(0).statusCode()));
        assertEquals(200, responses.get(1).statusCode());
        assertEquals("CANCELLED", bookingRepository.findById(booking.getId()).orElseThrow().getStatus().name());
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status = 'CANCELLED'", Integer.class));
    }

    @Test
    void availabilityReadDoesNotWrite() throws Exception {
        assertEquals(200, send("GET", "/api/trips/" + tripId + "/seats", firstUser, null).statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
        Booking booking = create(firstUser, List.of(firstSeatId));
        JsonNode seats = readJson(send("GET", "/api/trips/" + tripId + "/seats", firstUser, null).body());
        assertEquals("BOOKED", seats.get(0).path("status").asText());
        assertEquals(403, send("PATCH", "/api/bookings/" + booking.getId() + "/tickets/" +
                ticketRepository.findByBookingIdOrderById(booking.getId()).get(0).getId() + "/cancel", secondUser, null).statusCode());
        bookingService.cancelBooking(firstUser, booking.getId());
        assertEquals(1, readJson(send("GET", "/api/bookings/my", firstUser, null).body()).size());
    }

    @Test
    void separateRequestsCreatePendingBookingsForSameUserAndTrip() {
        Booking first = create(firstUser, List.of(firstSeatId));
        Booking second = create(firstUser, List.of(secondSeatId));
        org.junit.jupiter.api.Assertions.assertNotEquals(first.getId(), second.getId());
        assertEquals(2, bookingRepository.count());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM tickets t JOIN bookings b ON t.booking_id=b.id WHERE t.trip_id <> b.trip_id", Integer.class));
    }

    @Test
    void invalidSeatAndTripAndNullPassengerNeverCreateRows() throws Exception {
        jdbc.update("UPDATE seats SET status = 'INACTIVE' WHERE id = ?", firstSeatId);
        assertEquals(400, send("POST", "/api/bookings", firstUser, requestBody(List.of(firstSeatId))).statusCode());
        jdbc.update("UPDATE trips SET status = 'CANCELLED' WHERE id = ?", tripId);
        assertEquals(400, send("POST", "/api/bookings", firstUser, requestBody(List.of(secondSeatId))).statusCode());
        assertEquals(400, send("POST", "/api/bookings", firstUser,
                "{\"tripId\":" + tripId + ",\"seatIds\":[" + secondSeatId + "],\"passengers\":[null]}").statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void uniqueConstraintFailureRollsBackBeforeReadingConflictDetails() throws Exception {
        create(firstUser, List.of(secondSeatId));
        org.mockito.Mockito.doReturn(List.of()).when(ticketRepository)
                .findOccupiedForSeatsForUpdate(org.mockito.ArgumentMatchers.eq(tripId),
                        org.mockito.ArgumentMatchers.anyCollection(), org.mockito.ArgumentMatchers.anyCollection());
        var result = send("POST", "/api/bookings", secondUser, requestBody(List.of(firstSeatId, secondSeatId)));
        assertEquals(409, result.statusCode(), result.body());
        assertEquals("A02", readJson(result.body()).path("conflictSeats").get(0).path("seatNumber").asText());
        assertEquals(1, bookingRepository.count());
        assertEquals(1, ticketRepository.count());
    }

    @Test
    void generatedColumnProtectsBothActiveStatesAndAllowsCancelledHistory() {
        Booking booking = create(firstUser, List.of(firstSeatId));
        String duplicate = "INSERT INTO tickets (booking_id,trip_id,seat_id,passenger_name,price,status) VALUES (?,?,?,'Other',125,?)";
        for (String status : List.of("RESERVED", "CONFIRMED")) {
            assertThrows(org.springframework.dao.DataIntegrityViolationException.class,
                    () -> jdbc.update(duplicate, booking.getId(), tripId, firstSeatId, status));
        }
        assertEquals(tripId, jdbc.queryForObject("SELECT occupied_trip_id FROM tickets", Long.class));
        bookingService.cancelBooking(firstUser, booking.getId());
        org.junit.jupiter.api.Assertions.assertNull(jdbc.queryForObject("SELECT occupied_trip_id FROM tickets", Long.class));
        jdbc.update(duplicate, booking.getId(), tripId, firstSeatId, "CANCELLED");
        create(secondUser, List.of(firstSeatId));
        assertEquals(3, ticketRepository.count());
    }

    @Test
    void partialFullAndRepeatedCancellationPreserveTotalsAndTimestamps() {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        var tickets = ticketRepository.findByBookingIdOrderById(booking.getId());
        var partial = bookingService.cancelTicket(firstUser, booking.getId(), tickets.get(0).getId());
        assertEquals(new BigDecimal("125.00"), partial.totalAmount());
        assertEquals("PENDING", partial.status().name());
        assertEquals(partial, bookingService.cancelTicket(firstUser, booking.getId(), tickets.get(0).getId()));
        var cancelled = bookingService.cancelTicket(firstUser, booking.getId(), tickets.get(1).getId());
        assertEquals(0, cancelled.totalAmount().compareTo(BigDecimal.ZERO));
        assertEquals("CANCELLED", cancelled.status().name());
        var repeated = bookingService.cancelBooking(firstUser, booking.getId());
        assertEquals(cancelled.cancelledAt().withNano(0), repeated.cancelledAt().withNano(0));
        assertEquals(2, ticketRepository.count());
    }

    @Test
    void activeTicketsCannotBeCancelledAfterDepartureButRepeatedCancellationStillWorks() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        var tickets = ticketRepository.findByBookingIdOrderById(booking.getId());
        bookingService.cancelTicket(firstUser, booking.getId(), tickets.get(0).getId());
        jdbc.update("UPDATE trips SET departure_time = ? WHERE id = ?", LocalDateTime.now().minusHours(1), tripId);
        assertEquals(400, send("PATCH", "/api/bookings/" + booking.getId() + "/cancel", firstUser, null).statusCode());
        assertEquals(400, send("PATCH", "/api/bookings/" + booking.getId() + "/tickets/" + tickets.get(1).getId() + "/cancel", firstUser, null).statusCode());
        assertEquals(200, send("PATCH", "/api/bookings/" + booking.getId() + "/tickets/" + tickets.get(0).getId() + "/cancel", firstUser, null).statusCode());
    }

    @Test
    void invalidPassengersEmptyDuplicateAndWrongBusSeatsAreRejected() throws Exception {
        String valid = requestBody(List.of(firstSeatId));
        List<String> invalid = List.of(
                requestBody(List.of()), requestBody(List.of(firstSeatId, firstSeatId)),
                valid.replace("Passenger " + firstSeatId, " "),
                valid.replace("\"seatId\":" + firstSeatId, "\"seatId\":" + secondSeatId),
                valid.replace("\"seatIds\":[" + firstSeatId + "]", "\"seatIds\":[" + firstSeatId + "," + secondSeatId + "]"),
                valid.replace("\"passengers\":[", "\"passengers\":[{\"seatId\":" + firstSeatId + ",\"passengerName\":\"Duplicate\"},"));
        for (String body : invalid) {
            var response = send("POST", "/api/bookings", firstUser, body);
            assertEquals(400, response.statusCode(), response.body());
        }
        jdbc.update("INSERT INTO buses (license_plate,bus_type,seat_count) VALUES ('OTHER','Coach',1)");
        jdbc.update("UPDATE seats SET bus_id=(SELECT id FROM buses WHERE license_plate='OTHER') WHERE id=?", firstSeatId);
        assertEquals(400, send("POST", "/api/bookings", firstUser, valid).statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void clientPricesAreIgnoredAndAdminListDoesNotConfirm() throws Exception {
        String payload = requestBody(List.of(firstSeatId)).replaceFirst("\\{", "{\"price\":1,\"totalAmount\":1,");
        assertEquals(201, send("POST", "/api/bookings", firstUser, payload).statusCode());
        jdbc.update("UPDATE users SET role='ADMIN' WHERE id=?", secondUser);
        assertEquals(200, send("GET", "/api/admin/bookings", secondUser, null).statusCode());
        assertEquals("PENDING", bookingRepository.findAll().get(0).getStatus().name());
        assertEquals(new BigDecimal("125.00"), bookingRepository.findAll().get(0).getTotalAmount());
        assertEquals(TicketStatus.RESERVED, ticketRepository.findAll().get(0).getStatus());
    }

    @Test
    void confirmationRejectsBookingsWithoutActiveTickets() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId));
        jdbc.update("UPDATE users SET role='ADMIN' WHERE id=?", secondUser);
        jdbc.update("UPDATE tickets SET status='CANCELLED', cancelled_at=CURRENT_TIMESTAMP WHERE booking_id=?", booking.getId());
        for (String status : List.of("PENDING", "CONFIRMED")) {
            jdbc.update("UPDATE bookings SET status=? WHERE id=?", status, booking.getId());
            assertEquals(400, send("POST", "/api/admin/bookings/" + booking.getId() + "/confirm", secondUser, null).statusCode());
        }
        assertEquals(TicketStatus.CANCELLED, ticketRepository.findAll().get(0).getStatus());
    }

    @Test
    void unrelatedDatabaseConstraintDoesNotBecomeSeatConflict() throws Exception {
        org.mockito.Mockito.doThrow(new org.springframework.dao.DataIntegrityViolationException("Other constraint",
                new java.sql.SQLException("Duplicate entry 'code' for key 'uk_bookings_code'", "23000", 1062)))
                .when(ticketRepository).saveAllAndFlush(org.mockito.ArgumentMatchers.any());
        var result = send("POST", "/api/bookings", firstUser, requestBody(List.of(firstSeatId)));
        assertEquals(500, result.statusCode());
        assertEquals(0, readJson(result.body()).path("conflictSeats").size());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void cancelledWholeBookingCanBeCancelledAgainAfterDepartureWithoutChanges() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        bookingService.cancelBooking(firstUser, booking.getId());
        var current = bookingService.getBookingDetail(firstUser, booking.getId());
        jdbc.update("UPDATE trips SET departure_time=? WHERE id=?", LocalDateTime.now().minusHours(1), tripId);
        assertEquals(current, bookingService.cancelBooking(firstUser, booking.getId()));
        assertEquals(2, ticketRepository.count());
    }

    @Test
    void unauthenticatedSubmissionIsRejected() throws Exception {
        var request = HttpRequest.newBuilder().uri(URI.create("http://localhost:" + port + "/api/bookings"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody(List.of(firstSeatId)))).build();
        assertEquals(401, HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString()).statusCode());
        assertEquals(0, bookingRepository.count());
    }

    @Test
    void reservedAndConfirmedSeatsConflictAndCancellationReleasesAvailability() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        var tickets = ticketRepository.findByBookingIdOrderById(booking.getId());
        assertEquals("BOOKED", availability(firstSeatId));
        assertEquals("BOOKED", availability(secondSeatId));
        assertEquals("ACTIVE", jdbc.queryForObject("SELECT status FROM seats WHERE id=?", String.class, firstSeatId));
        assertEquals(409, send("POST", "/api/bookings", secondUser, requestBody(List.of(firstSeatId))).statusCode());

        bookingService.confirmBooking(booking.getId());
        assertEquals("BOOKED", availability(firstSeatId));
        assertEquals(409, send("POST", "/api/bookings", secondUser, requestBody(List.of(firstSeatId))).statusCode());
        jdbc.update("UPDATE seats SET status='INACTIVE' WHERE id=?", firstSeatId);
        assertEquals("INACTIVE", availability(firstSeatId));
        jdbc.update("UPDATE seats SET status='ACTIVE' WHERE id=?", firstSeatId);

        assertEquals(200, send("PATCH", "/api/bookings/" + booking.getId() + "/tickets/" + tickets.get(0).getId() + "/cancel",
                firstUser, null).statusCode());
        assertEquals("AVAILABLE", availability(firstSeatId));
        assertEquals("BOOKED", availability(secondSeatId));
        assertEquals(201, send("POST", "/api/bookings", secondUser, requestBody(List.of(firstSeatId))).statusCode());
    }

    @Test
    void missingTripBookingSeatAndTicketReturn404WithoutCreatingPartialRows() throws Exception {
        long missingId = Long.MAX_VALUE;
        for (String path : List.of("/api/trips/" + missingId, "/api/trips/" + missingId + "/seats",
                "/api/bookings/" + missingId)) {
            assertEquals(404, send("GET", path, firstUser, null).statusCode(), path);
        }
        assertEquals(404, send("POST", "/api/bookings", firstUser,
                requestBody(List.of(firstSeatId)).replace("\"tripId\":" + tripId, "\"tripId\":" + missingId)).statusCode());
        assertEquals(404, send("POST", "/api/bookings", firstUser,
                requestBody(List.of(firstSeatId, missingId))).statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
        assertEquals(404, send("PATCH", "/api/bookings/" + missingId + "/cancel", firstUser, null).statusCode());
        assertEquals(404, send("DELETE", "/api/bookings/" + missingId, firstUser, null).statusCode());

        Booking booking = create(firstUser, List.of(firstSeatId));
        assertEquals(404, send("PATCH", "/api/bookings/" + booking.getId() + "/tickets/" + missingId + "/cancel",
                firstUser, null).statusCode());
        assertEquals(TicketStatus.RESERVED, ticketRepository.findAll().get(0).getStatus());
    }

    @Test
    void myBookingsAliasesReturnOnlyTheCurrentUsersBookings() throws Exception {
        Booking mine = create(firstUser, List.of(firstSeatId));
        create(secondUser, List.of(secondSeatId));
        for (String path : List.of("/api/bookings", "/api/bookings/my")) {
            var response = send("GET", path, firstUser, null);
            assertEquals(200, response.statusCode());
            JsonNode body = readJson(response.body());
            assertEquals(1, body.size());
            assertEquals(mine.getId(), body.get(0).path("id").asLong());
        }
        assertEquals(200, send("GET", "/api/bookings/" + mine.getId(), firstUser, null).statusCode());
    }

    @Test
    void aTicketFromAnotherBookingCannotBeCancelledThroughAnOwnedBooking() throws Exception {
        Booking mine = create(firstUser, List.of(firstSeatId));
        Booking other = create(secondUser, List.of(secondSeatId));
        Long otherTicket = ticketRepository.findByBookingIdOrderById(other.getId()).get(0).getId();
        assertEquals(404, send("PATCH", "/api/bookings/" + mine.getId() + "/tickets/" + otherTicket + "/cancel",
                firstUser, null).statusCode());
        assertEquals(TicketStatus.RESERVED, ticketRepository.findById(otherTicket).orElseThrow().getStatus());
    }

    @Test
    void deleteBookingAliasCancelsTicketsAndAllowsRebooking() throws Exception {
        Booking booking = create(firstUser, List.of(firstSeatId, secondSeatId));
        var response = send("DELETE", "/api/bookings/" + booking.getId(), firstUser, null);
        assertEquals(200, response.statusCode());
        assertEquals("CANCELLED", readJson(response.body()).path("status").asText());
        assertEquals(0, readJson(response.body()).path("totalAmount").decimalValue().signum());
        assertEquals("AVAILABLE", availability(firstSeatId));
        assertEquals("AVAILABLE", availability(secondSeatId));
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status='CANCELLED'", Integer.class));
        assertEquals(201, send("POST", "/api/bookings", secondUser,
                requestBody(List.of(firstSeatId, secondSeatId))).statusCode());
    }

    @Test
    void malformedPathQueryDateAndRequestBodyReturn400() throws Exception {
        for (String path : List.of("/api/trips/abc", "/api/trips/abc/seats", "/api/bookings/abc",
                "/api/trips", "/api/trips?from=A&to=B", "/api/trips?from=A&to=B&date=invalid")) {
            var response = send("GET", path, firstUser, null);
            assertEquals(400, response.statusCode(), path + ": " + response.body());
            assertEquals(400, readJson(response.body()).path("status").asInt());
            assertEquals(path.split("\\?")[0], readJson(response.body()).path("path").asText());
        }
        Long admin = adminUser();
        assertEquals(400, send("GET", "/api/admin/bookings?status=INVALID", admin, null).statusCode());
        for (String body : List.of("", "{", "{}", "{\"tripId\":{},\"seatIds\":[],\"passengers\":[]}")) {
            assertEquals(400, send("POST", "/api/bookings", firstUser, body).statusCode(), body);
        }
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void tripBusCanChangeWithoutHistoryButNotAfterBookingEvenWhenCancelled() throws Exception {
        Long newBus = insertOtherBus();
        Long admin = adminUser();
        String replacement = tripBody(newBus);
        var changed = send("PUT", "/api/admin/trips/" + tripId, admin, replacement);
        assertEquals(200, changed.statusCode(), changed.body());
        assertEquals(newBus, readJson(changed.body()).path("bus").path("id").asLong());
        Long originalBus = jdbc.queryForObject("SELECT bus_id FROM seats WHERE id=?", Long.class, firstSeatId);
        assertEquals(200, send("PUT", "/api/admin/trips/" + tripId, admin, tripBody(originalBus)).statusCode());

        Booking booking = create(firstUser, List.of(firstSeatId));
        for (String status : List.of("PENDING", "CONFIRMED", "CANCELLED")) {
            if (status.equals("CONFIRMED")) bookingService.confirmBooking(booking.getId());
            if (status.equals("CANCELLED")) bookingService.cancelBooking(firstUser, booking.getId());
            var rejected = send("PUT", "/api/admin/trips/" + tripId, admin, replacement);
            assertEquals(400, rejected.statusCode(), rejected.body());
            org.junit.jupiter.api.Assertions.assertTrue(readJson(rejected.body()).path("message").asText().contains("Cannot change the bus"));
            assertEquals(originalBus, jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId));
        }
        assertEquals(200, send("PUT", "/api/admin/trips/" + tripId, admin, tripBody(originalBus)).statusCode());
        assertEquals(400, send("DELETE", "/api/admin/trips/" + tripId, admin, null).statusCode());
    }

    @Test
    void bookingHistoryWithoutTicketsStillBlocksChangingTheBus() throws Exception {
        Long newBus = insertOtherBus();
        create(firstUser, List.of(firstSeatId));
        jdbc.update("DELETE FROM tickets");
        assertEquals(400, send("PUT", "/api/admin/trips/" + tripId, adminUser(), tripBody(newBus)).statusCode());
    }

    @Test
    void ticketHistoryOfTheTripAlsoBlocksChangingItsBus() throws Exception {
        Long newBus = insertOtherBus();
        Booking booking = create(firstUser, List.of(firstSeatId));
        jdbc.update("INSERT INTO trips (route_id,bus_id,departure_time,arrival_time,price,status) "
                + "SELECT route_id,bus_id,departure_time,arrival_time,price,status FROM trips WHERE id=?", tripId);
        Long otherTrip = jdbc.queryForObject("SELECT MAX(id) FROM trips", Long.class);
        // Simulate pre-existing inconsistent data to exercise the separate ticket check.
        jdbc.update("UPDATE bookings SET trip_id=? WHERE id=?", otherTrip, booking.getId());
        assertEquals(400, send("PUT", "/api/admin/trips/" + tripId, adminUser(), tripBody(newBus)).statusCode());
    }

    @Test
    void concurrentBookingAndBusChangeCannotProduceMismatchedTicketSeats() throws Exception {
        Long newBus = insertOtherBus();
        Long admin = adminUser();
        String replacement = tripBody(newBus);
        var responses = runHttpTogether(
                () -> send("POST", "/api/bookings", firstUser, requestBody(List.of(firstSeatId))),
                () -> send("PUT", "/api/admin/trips/" + tripId, admin, replacement));
        List<Integer> codes = responses.stream().map(HttpResponse::statusCode).toList();
        org.junit.jupiter.api.Assertions.assertTrue(codes.equals(List.of(201, 400)) || codes.equals(List.of(400, 200)), codes.toString());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM tickets t JOIN trips tr ON tr.id=t.trip_id "
                + "JOIN seats s ON s.id=t.seat_id WHERE tr.bus_id<>s.bus_id", Integer.class));
        assertEquals(codes.get(0) == 201 ? 1L : 0L, bookingRepository.count());
    }

    @Test
    void concurrentRequestsForDifferentSeatsBothSucceed() throws Exception {
        var responses = runHttpTogether(httpCall(firstUser, List.of(firstSeatId)), httpCall(secondUser, List.of(secondSeatId)));
        assertEquals(List.of(201, 201), responses.stream().map(HttpResponse::statusCode).toList());
        assertEquals(2, bookingRepository.count());
        assertEquals(2, ticketRepository.count());
    }

    @Test
    void invalidSeatInAMultiSeatRequestRollsBackTheEntireBooking() throws Exception {
        jdbc.update("UPDATE seats SET status='INACTIVE' WHERE id=?", secondSeatId);
        assertEquals(400, send("POST", "/api/bookings", firstUser,
                requestBody(List.of(firstSeatId, secondSeatId))).statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
        jdbc.update("UPDATE seats SET status='ACTIVE',bus_id=? WHERE id=?", insertOtherBus(), secondSeatId);
        assertEquals(400, send("POST", "/api/bookings", firstUser,
                requestBody(List.of(firstSeatId, secondSeatId))).statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void unexpectedFailureAfterTicketInsertionRollsBackBookingAndTickets() throws Exception {
        var inserted = new java.util.concurrent.atomic.AtomicBoolean();
        org.mockito.Mockito.doAnswer(invocation -> {
            Iterable<com.example.backend.entity.Ticket> tickets = invocation.getArgument(0);
            for (var ticket : tickets) entityManager.persist(ticket);
            entityManager.flush();
            inserted.set(bookingRepository.count() == 1 && ticketRepository.count() == 2);
            throw new IllegalStateException("Simulated unexpected failure after flushing tickets");
        }).when(ticketRepository).saveAllAndFlush(org.mockito.ArgumentMatchers.any());
        var response = send("POST", "/api/bookings", firstUser, requestBody(List.of(firstSeatId, secondSeatId)));
        assertEquals(500, response.statusCode(), response.body());
        org.junit.jupiter.api.Assertions.assertTrue(inserted.get(), "Failure must be injected after actual ticket insertion");
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
    }

    @Test
    void tripValidationAndReferencedResourcesReturn400Or404() throws Exception {
        Long busId = jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId);
        Long admin = adminUser();
        String valid = tripBody(busId);
        assertEquals(404, send("PUT", "/api/admin/trips/" + Long.MAX_VALUE, admin, valid).statusCode());
        assertEquals(404, send("DELETE", "/api/admin/trips/" + Long.MAX_VALUE, admin, null).statusCode());
        assertEquals(404, send("POST", "/api/admin/trips", admin, tripBody(Long.MAX_VALUE)).statusCode());
        JsonNode noRoute = objectMapper.readTree(valid);
        ((tools.jackson.databind.node.ObjectNode) noRoute.path("route")).put("id", Long.MAX_VALUE);
        assertEquals(404, send("POST", "/api/admin/trips", admin, objectMapper.writeValueAsString(noRoute)).statusCode());
        for (String field : List.of("route", "bus", "departureTime", "arrivalTime", "price", "status")) {
            var missing = (tools.jackson.databind.node.ObjectNode) objectMapper.readTree(valid);
            missing.remove(field);
            assertEquals(400, send("PUT", "/api/admin/trips/" + tripId, admin,
                    objectMapper.writeValueAsString(missing)).statusCode(), field);
        }
        var invalid = (tools.jackson.databind.node.ObjectNode) objectMapper.readTree(valid);
        invalid.put("price", -1);
        assertEquals(400, send("POST", "/api/admin/trips", admin, objectMapper.writeValueAsString(invalid)).statusCode());
        invalid.put("price", 125);
        invalid.put("arrivalTime", invalid.path("departureTime").asText());
        assertEquals(400, send("POST", "/api/admin/trips", admin, objectMapper.writeValueAsString(invalid)).statusCode());
    }

    @Test
    void tripDateSearchExcludesMidnightOfTheFollowingDay() throws Exception {
        LocalDateTime departure = jdbc.queryForObject("SELECT departure_time FROM trips WHERE id=?",
                java.sql.Timestamp.class, tripId).toLocalDateTime();
        LocalDateTime nextDay = departure.toLocalDate().plusDays(1).atStartOfDay();
        jdbc.update("INSERT INTO trips (route_id,bus_id,departure_time,arrival_time,price,status) "
                + "SELECT route_id,bus_id,?,?,price,status FROM trips WHERE id=?", nextDay, nextDay.plusHours(1), tripId);
        var response = send("GET", "/api/trips?from=A&to=B&date=" + departure.toLocalDate(), firstUser, null);
        assertEquals(200, response.statusCode());
        assertEquals(1, readJson(response.body()).size());
        assertEquals(tripId, readJson(response.body()).get(0).path("id").asLong());
        Long routeId = jdbc.queryForObject("SELECT route_id FROM trips WHERE id=?", Long.class, tripId);
        assertEquals(1, tripService.getTripsByRouteAndDate(routeId, departure.toLocalDate()).size());
    }

    @Test
    void priceAndBookingTotalOutsideDecimalLimitsAreBadRequests() throws Exception {
        Long busId = jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId);
        Long admin = adminUser();
        for (BigDecimal price : List.of(new BigDecimal("10000000000.00"), new BigDecimal("125.001"))) {
            var invalid = (tools.jackson.databind.node.ObjectNode) objectMapper.readTree(tripBody(busId));
            invalid.put("price", price);
            assertEquals(400, send("POST", "/api/admin/trips", admin, objectMapper.writeValueAsString(invalid)).statusCode());
            assertEquals(400, send("PUT", "/api/admin/trips/" + tripId, admin, objectMapper.writeValueAsString(invalid)).statusCode());
        }
        jdbc.update("UPDATE trips SET price=9999999999.99 WHERE id=?", tripId);
        assertEquals(400, send("POST", "/api/bookings", firstUser,
                requestBody(List.of(firstSeatId, secondSeatId))).statusCode());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, ticketRepository.count());
        assertEquals(201, send("POST", "/api/bookings", firstUser, requestBody(List.of(firstSeatId))).statusCode());
    }

    @Test
    void adminCanCreateAndDeleteATripWithoutBookingHistory() throws Exception {
        Long busId = jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId);
        Long admin = adminUser();
        var created = send("POST", "/api/admin/trips", admin, tripBody(busId));
        assertEquals(201, created.statusCode(), created.body());
        Long createdId = readJson(created.body()).path("id").asLong();
        assertEquals(200, send("GET", "/api/trips/" + createdId, firstUser, null).statusCode());
        assertEquals(204, send("DELETE", "/api/admin/trips/" + createdId, admin, null).statusCode());
        assertEquals(404, send("GET", "/api/trips/" + createdId, firstUser, null).statusCode());
    }

    @Test
    void creatingATripWithAnIdCannotBypassTheBusChangeGuard() throws Exception {
        Long otherBus = insertOtherBus();
        create(firstUser, List.of(firstSeatId));
        Long originalBus = jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId);
        var payload = (tools.jackson.databind.node.ObjectNode) objectMapper.readTree(tripBody(otherBus));
        payload.put("id", tripId);
        var response = send("POST", "/api/admin/trips", adminUser(), objectMapper.writeValueAsString(payload));
        assertEquals(400, response.statusCode(), response.body());
        assertEquals(originalBus, jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM tickets t JOIN trips tr ON tr.id=t.trip_id "
                + "JOIN seats s ON s.id=t.seat_id WHERE tr.bus_id<>s.bus_id", Integer.class));
    }

    @Test
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named = "postman.newman.js", matches = ".+")
    void postmanCollectionRunsAgainstAnIsolatedBackendWithAllFixtures() throws Exception {
        // Optional test tool only; Maven/POM and production dependencies stay unchanged.
        Long otherBus = insertOtherBus();
        jdbc.update("INSERT INTO seats (bus_id,seat_number,seat_type,floor_number,status) "
                + "VALUES (?,'B01','REGULAR',1,'ACTIVE'),(?,'B02','REGULAR',1,'ACTIVE')", otherBus, otherBus);
        Long wrongBusSeat = seatId("B01");
        Long originalBus = jdbc.queryForObject("SELECT bus_id FROM trips WHERE id=?", Long.class, tripId);
        jdbc.update("UPDATE buses SET seat_count=3 WHERE id=?", originalBus);
        jdbc.update("INSERT INTO seats (bus_id,seat_number,seat_type,floor_number,status) "
                + "VALUES (?,'A03','REGULAR',1,'INACTIVE')", originalBus);
        Long admin = adminUser();
        Map<String, String> variables = Map.of(
                "baseUrl", "http://localhost:" + port,
                "tripId", tripId.toString(),
                "admin_token", jwtService.generateToken(userRepository.findById(admin).orElseThrow()),
                "differentBusId", otherBus.toString(),
                "wrongBusSeatId", wrongBusSeat.toString());
        var environment = Map.of("name", "Isolated backend test",
                "values", variables.entrySet().stream()
                        .map(entry -> Map.of("key", entry.getKey(), "value", entry.getValue(), "enabled", true))
                        .toList());
        var environmentFile = java.nio.file.Files.createTempFile(java.nio.file.Path.of("target"), "postman-env-", ".json");
        var logFile = java.nio.file.Path.of("target/postman-scope-smoke.log");
        Process runner = null;
        try {
            java.nio.file.Files.writeString(environmentFile, objectMapper.writeValueAsString(environment));
            runner = new ProcessBuilder("node", System.getProperty("postman.newman.js"), "run",
                    "booking-test.postman_collection.json", "--environment", environmentFile.toString(),
                    "--reporters", "cli", "--color", "off", "--timeout-request", "10000", "--bail")
                    .redirectErrorStream(true).redirectOutput(logFile.toFile()).start();
            org.junit.jupiter.api.Assertions.assertTrue(runner.waitFor(120, java.util.concurrent.TimeUnit.SECONDS),
                    "Newman timed out; see target/postman-scope-smoke.log");
            assertEquals(0, runner.exitValue(), "Newman failed; see target/postman-scope-smoke.log");
            String log = java.nio.file.Files.readString(logFile);
            org.junit.jupiter.api.Assertions.assertFalse(log.contains("NOT RUN / TODO:"), "All optional fixtures must run");
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM tickets WHERE status IN ('RESERVED','CONFIRMED')", Integer.class),
                    "Collection must release every test seat on completion");
        } finally {
            if (runner != null && runner.isAlive()) runner.destroyForcibly();
            // The file holds a test-only token; do not leave it in build artifacts.
            java.nio.file.Files.deleteIfExists(environmentFile);
        }
    }

    private String availability(Long seatId) throws Exception {
        var response = send("GET", "/api/trips/" + tripId + "/seats", firstUser, null);
        assertEquals(200, response.statusCode());
        for (JsonNode seat : readJson(response.body())) {
            if (seat.path("seatId").asLong() == seatId) return seat.path("status").asText();
        }
        throw new AssertionError("Seat missing from availability: " + seatId);
    }

    private Long insertOtherBus() {
        jdbc.update("INSERT INTO buses (license_plate,bus_type,seat_count) VALUES ('OTHER-BUS','Coach',2)");
        return jdbc.queryForObject("SELECT id FROM buses WHERE license_plate='OTHER-BUS'", Long.class);
    }

    private Long adminUser() {
        Long admin = insertUser("admin");
        jdbc.update("UPDATE users SET role='ADMIN' WHERE id=?", admin);
        return admin;
    }

    private String tripBody(Long busId) {
        Long routeId = jdbc.queryForObject("SELECT route_id FROM trips WHERE id=?", Long.class, tripId);
        LocalDateTime departure = jdbc.queryForObject("SELECT departure_time FROM trips WHERE id=?",
                java.sql.Timestamp.class, tripId).toLocalDateTime();
        LocalDateTime arrival = jdbc.queryForObject("SELECT arrival_time FROM trips WHERE id=?",
                java.sql.Timestamp.class, tripId).toLocalDateTime();
        return objectMapper.writeValueAsString(Map.of("route", Map.of("id", routeId), "bus", Map.of("id", busId),
                "departureTime", departure.toString(), "arrivalTime", arrival.toString(), "price", 125, "status", "SCHEDULED"));
    }

    private Booking create(Long userId, List<Long> seatIds) {
        Long bookingId = bookingService.createBooking(userId, request(seatIds)).id();
        return bookingRepository.findById(bookingId).orElseThrow();
    }

    private CreateBookingRequest request(List<Long> seatIds) {
        return new CreateBookingRequest(
                tripId,
                seatIds,
                seatIds.stream().map(id -> new PassengerDetails(id, "Passenger " + id, "0900000000")).toList()
        );
    }

    private String requestBody(List<Long> seatIds) {
        String ids = seatIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));
        String passengerJson = seatIds.stream()
                .map(id -> "{\"seatId\":" + id + ",\"passengerName\":\"Passenger " + id
                        + "\",\"passengerPhone\":\"0900000000\"}")
                .collect(java.util.stream.Collectors.joining(","));
        return "{\"tripId\":" + tripId + ",\"seatIds\":[" + ids + "],\"passengers\":[" + passengerJson + "]}";
    }

    private List<HttpResponse<String>> runHttpTogether(HttpCall first, HttpCall second) throws Exception {
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<HttpResponse<String>> firstResult = executor.submit(() -> runAfterBarrier(first, ready, start));
            Future<HttpResponse<String>> secondResult = executor.submit(() -> runAfterBarrier(second, ready, start));
            org.junit.jupiter.api.Assertions.assertTrue(ready.await(10, java.util.concurrent.TimeUnit.SECONDS));
            start.countDown();
            return List.of(firstResult.get(30, java.util.concurrent.TimeUnit.SECONDS), secondResult.get(30, java.util.concurrent.TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }
    }

    private HttpResponse<String> runAfterBarrier(
            HttpCall call,
            CountDownLatch ready,
            CountDownLatch start
    ) throws Exception {
        ready.countDown();
        start.await();
        return call.run();
    }

    private Long insertUser(String suffix) {
        jdbc.update("""
                INSERT INTO users (username, email, password_hash, role, created_at, updated_at)
                VALUES (?, ?, 'test-hash', 'CUSTOMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, suffix, suffix + "@example.test");
        return jdbc.queryForObject("SELECT id FROM users WHERE username = ?", Long.class, suffix);
    }

    private Long seatId(String number) {
        return jdbc.queryForObject("SELECT id FROM seats WHERE seat_number = ?", Long.class, number);
    }

    private HttpResponse<String> send(String method, String path, Long userId, String body)
            throws Exception {
        return HttpClient.newHttpClient().send(
                buildHttpRequest(method, path, userId, body),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpCall httpCall(Long userId, List<Long> seatIds) throws Exception {
        HttpRequest request = buildHttpRequest(
                "POST", "/api/bookings", userId, requestBody(seatIds));
        HttpClient client = HttpClient.newHttpClient();
        return () -> client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest buildHttpRequest(String method, String path, Long userId, String body)
            throws Exception {
        User user = userRepository.findById(userId).orElseThrow();
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Authorization", "Bearer " + jwtService.generateToken(user))
                .header("Content-Type", "application/json");
        HttpRequest.BodyPublisher publisher = body == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body);
        return builder.method(method, publisher).build();
    }

    private JsonNode readJson(String json) {
        return objectMapper.readTree(json);
    }

    @FunctionalInterface
    private interface HttpCall {
        HttpResponse<String> run() throws Exception;
    }
}
