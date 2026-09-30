package com.example.backend.repository;

import com.example.backend.entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s join fetch s.bus where s.id = :id")
    Optional<Seat> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = "bus")
    List<Seat> findByBusIdOrderByFloorNumberAscRowNumberAscColumnNumberAscSeatNumberAsc(Long busId);

    List<Seat> findByIdInOrderByIdAsc(List<Long> ids);
}