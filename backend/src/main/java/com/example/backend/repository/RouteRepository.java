package com.example.backend.repository;

import com.example.backend.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RouteRepository extends JpaRepository<Route, Long> {

    Optional<Route> findByDepartureCityAndDestinationCity(
            String departureCity,
            String destinationCity
    );

    boolean existsByDepartureCityAndDestinationCity(
            String departureCity,
            String destinationCity
    );
}