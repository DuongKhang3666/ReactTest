package com.example.backend.entity;

import com.example.backend.enums.BookingStatus;
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
        name = "bookings",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_bookings_code", columnNames = "booking_code")
        },
        indexes = {
                @Index(name = "idx_bookings_user", columnList = "user_id, booked_at"),
                @Index(name = "idx_bookings_trip", columnList = "trip_id, status")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, length = 30)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false ,
            foreignKey = @ForeignKey(name = "fk_bookings_user")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trip_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_bookings_trip")
    )
    private Trip trip;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "booked_at", nullable = false, updatable = false)
    private LocalDateTime bookedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(length = 255)
    private String note;

    @PrePersist
    protected void onCreate() {
        if (bookedAt == null) {
            bookedAt = LocalDateTime.now();
        }
        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }
}