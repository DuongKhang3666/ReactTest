package com.example.backend.controller;

import com.example.backend.entity.Bus;
import com.example.backend.service.BusService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping
    public List<Bus> getAllBuses() {
        return busService.getAllBuses();
    }

    @GetMapping("/{id}")
    public Bus getBusById(@PathVariable Long id) {
        return busService.getBusById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Bus createBus(@RequestBody Bus bus) {
        return busService.createBus(bus);
    }

    @PutMapping("/{id}")
    public Bus updateBus(
            @PathVariable Long id,
            @RequestBody Bus bus
    ) {
        return busService.updateBus(id, bus);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
    }
}