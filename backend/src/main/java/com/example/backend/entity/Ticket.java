package com.example.backend.entity;

import com.example.backend.enums.TicketStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tickets",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tickets_booking_seat", columnNames = {"booking_id", "seat_id"}),
                @UniqueConstraint(name = "uk_tickets_occupied_seat", columnNames = {"occupied_trip_id", "seat_id"})
        },
        indexes = {
                @Index(name = "idx_tickets_trip_seat_status", columnList = "trip_id, seat_id, status"),
                @Index(name = "idx_tickets_booking", columnList = "booking_id"),
                @Index(name = "idx_tickets_trip", columnList = "trip_id, status"),
                @Index(name = "idx_tickets_seat", columnList = "seat_id"),
                @Index(name = "idx_tickets_hold_expiry", columnList = "status, expires_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "booking_id", referencedColumnName = "id", nullable = false,
                    foreignKey = @ForeignKey(name = "fk_tickets_booking_trip")),
            @JoinColumn(name = "trip_id", referencedColumnName = "trip_id", nullable = false,
                    insertable = false, updatable = false)
    })
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tickets_trip"))
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tickets_seat"))
    private Seat seat;

    @Column(name = "passenger_name", length = 120)
    private String passengerName;

    @Column(name = "passenger_phone", length = 20)
    private String passengerPhone;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.RESERVED;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "occupied_trip_id", insertable = false, updatable = false)
    private Long occupiedTripId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = TicketStatus.RESERVED;
        }
    }
}