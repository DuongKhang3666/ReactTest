package com.example.backend.repository;

import com.example.backend.entity.Seat;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Query(
            value = "SELECT * FROM seats WHERE id = :id FOR UPDATE",
            nativeQuery = true
    )
    Optional<Seat> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = "bus")
    List<Seat> findByBusIdOrderByFloorNumberAscRowNumberAscColumnNumberAscSeatNumberAsc(Long busId);

    List<Seat> findByIdInOrderByIdAsc(List<Long> ids);
}