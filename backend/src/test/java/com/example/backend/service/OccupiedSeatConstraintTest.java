package com.example.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import java.sql.SQLException;
import static org.junit.jupiter.api.Assertions.*;

class OccupiedSeatConstraintTest {
    @Test
    void matchesOnlyTheOccupiedSeatUniqueConstraint() {
        assertTrue(OccupiedSeatConstraint.matches(failure("tickets.uk_tickets_occupied_seat", 1062)));
        assertTrue(OccupiedSeatConstraint.matches(failure("uk_tickets_occupied_seat", 1062)));
        assertFalse(OccupiedSeatConstraint.matches(failure("uk_bookings_code", 1062)));
        assertFalse(OccupiedSeatConstraint.matches(failure("uk_tickets_occupied_seat_extra", 1062)));
        assertFalse(OccupiedSeatConstraint.matches(failure("uk_tickets_occupied_seat", 1452)));
        assertFalse(OccupiedSeatConstraint.matches(new DataIntegrityViolationException("other error")));
    }

    @Test
    void recognizesHibernateConstraintMetadataThroughSpringWrapper() {
        var sql = new SQLException("duplicate", "23000", 1062);
        var occupied = new org.hibernate.exception.ConstraintViolationException(
                "insert failed", sql, "tickets.uk_tickets_occupied_seat");
        assertTrue(OccupiedSeatConstraint.matches(new DataIntegrityViolationException("insert failed", occupied)));
        var unrelated = new org.hibernate.exception.ConstraintViolationException(
                "insert failed", sql, "uk_bookings_code");
        assertFalse(OccupiedSeatConstraint.matches(new DataIntegrityViolationException("insert failed", unrelated)));
    }

    private Throwable failure(String constraint, int code) {
        return new DataIntegrityViolationException("insert failed",
                new SQLException("Duplicate entry '1-2' for key '" + constraint + "'", "23000", code));
    }
}
