package com.messmate.controller;

import com.messmate.entity.Resident;
import com.messmate.service.ResidentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    private final ResidentService residentService;

    public ResidentController(ResidentService residentService) {
        this.residentService = residentService;
    }

    // CREATE
    @PostMapping
    public Resident createResident(
            @Valid @RequestBody Resident resident) {

        return residentService.createResident(resident);
    }

    // READ ALL
    @GetMapping
    public List<Resident> getAllResidents() {
        return residentService.getAllResidents();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Resident getResidentById(@PathVariable Long id) {
        return residentService.getResidentById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Resident updateResident(
            @PathVariable Long id,
            @Valid @RequestBody Resident resident) {

        return residentService.updateResident(id, resident);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteResident(@PathVariable Long id) {

        residentService.deleteResident(id);

        return "Resident deleted successfully";
    }
}