package com.example.backend.service;

import com.example.backend.entity.Bus;
import com.example.backend.repository.BusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusService {

    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));
    }

    public Bus createBus(Bus bus) {
        if (busRepository.existsByLicensePlate(bus.getLicensePlate())) {
            throw new RuntimeException("License plate already exists");
        }

        return busRepository.save(bus);
    }

    public Bus updateBus(Long id, Bus updatedBus) {
        Bus existingBus = getBusById(id);

        if (!existingBus.getLicensePlate().equals(updatedBus.getLicensePlate())
                && busRepository.existsByLicensePlate(updatedBus.getLicensePlate())) {
            throw new RuntimeException("License plate already exists");
        }

        existingBus.setLicensePlate(updatedBus.getLicensePlate());
        existingBus.setBusType(updatedBus.getBusType());
        existingBus.setSeatCount(updatedBus.getSeatCount());
        existingBus.setDescription(updatedBus.getDescription());
        existingBus.setStatus(updatedBus.getStatus());

        return busRepository.save(existingBus);
    }

    public void deleteBus(Long id) {
        Bus bus = getBusById(id);
        busRepository.delete(bus);
    }
}