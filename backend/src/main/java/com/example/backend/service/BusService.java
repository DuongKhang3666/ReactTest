package com.example.backend.service;

import com.example.backend.entity.Bus;
import com.example.backend.entity.Seat;
import com.example.backend.enums.SeatStatus;
import com.example.backend.enums.SeatType;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.SeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BusService {

    private final BusRepository busRepository;
    private final SeatRepository seatRepository;

    public BusService(
            BusRepository busRepository,
            SeatRepository seatRepository
    ) {
        this.busRepository = busRepository;
        this.seatRepository = seatRepository;
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Bus not found"));
    }

    @Transactional
    public Bus createBus(Bus bus) {
        if (busRepository.existsByLicensePlate(
                bus.getLicensePlate())) {
            throw new RuntimeException(
                    "License plate already exists");
        }

        int seatCount = bus.getSeatCount();
        if (seatCount != 12
                && seatCount != 24
                && seatCount != 36) {
            throw new IllegalArgumentException(
                    "Seat count must be 12, 24 or 36");
        }

        Bus savedBus = busRepository.save(bus);

        generateSeats(savedBus);

        return savedBus;
    }

    private void generateSeats(Bus bus) {
        int seatCount = bus.getSeatCount();

        int floors = seatCount == 12 ? 1 : 2;
        int columnsPerFloor = seatCount == 36 ? 3 : 2;
        int seatsPerFloor = seatCount / floors;

        List<Seat> seats = new ArrayList<>();

        for (int i = 0; i < seatCount; i++) {
            int floorNumber = i / seatsPerFloor + 1;
            int positionInFloor = i % seatsPerFloor;

            int rowNumber = positionInFloor / columnsPerFloor + 1;
            int columnNumber = positionInFloor % columnsPerFloor + 1;

            Seat seat = new Seat();

            seat.setBus(bus);
            seat.setSeatNumber("A" + String.format("%02d", i + 1));
            seat.setSeatType(SeatType.REGULAR);
            seat.setFloorNumber(floorNumber);
            seat.setRowNumber(rowNumber);
            seat.setColumnNumber(columnNumber);
            seat.setStatus(SeatStatus.ACTIVE);

            seats.add(seat);
        }

        seatRepository.saveAll(seats);
    }

    public Bus updateBus(Long id, Bus updatedBus) {
        Bus existingBus = getBusById(id);

        if (!existingBus.getLicensePlate()
                .equals(updatedBus.getLicensePlate())
                && busRepository.existsByLicensePlate(
                updatedBus.getLicensePlate())) {
            throw new RuntimeException(
                    "License plate already exists");
        }

        if (!existingBus.getSeatCount()
                .equals(updatedBus.getSeatCount())) {
            throw new IllegalArgumentException(
                    "Cannot change seat count directly. "
                            + "Existing seats may be referenced by tickets.");
        }

        existingBus.setLicensePlate(
                updatedBus.getLicensePlate());
        existingBus.setBusType(updatedBus.getBusType());
        existingBus.setDescription(
                updatedBus.getDescription());
        existingBus.setStatus(updatedBus.getStatus());

        return busRepository.save(existingBus);
    }

    public void deleteBus(Long id) {
        Bus bus = getBusById(id);
        busRepository.delete(bus);
    }
}