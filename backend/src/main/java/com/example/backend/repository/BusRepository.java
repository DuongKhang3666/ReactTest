package com.example.backend.repository;

import com.example.backend.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BusRepository extends JpaRepository<Bus, Long> {

    Optional<Bus> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlate(String licensePlate);
}