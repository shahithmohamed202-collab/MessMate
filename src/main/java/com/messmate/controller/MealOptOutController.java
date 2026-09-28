package com.messmate.controller;

import com.messmate.entity.MealOptOut;
import com.messmate.service.MealOptOutService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meal-opt-outs")
public class MealOptOutController {

    private final MealOptOutService mealOptOutService;

    public MealOptOutController(MealOptOutService mealOptOutService) {
        this.mealOptOutService = mealOptOutService;
    }

    // CREATE
    @PostMapping
    public MealOptOut createOptOut(
            @Valid @RequestBody MealOptOut optOut) {

        return mealOptOutService.createOptOut(optOut);
    }

    // READ ALL
    @GetMapping
    public List<MealOptOut> getAllOptOuts() {
        return mealOptOutService.getAllOptOuts();
    }

    // READ ONE
    @GetMapping("/{id}")
    public MealOptOut getOptOutById(@PathVariable Long id) {
        return mealOptOutService.getOptOutById(id);
    }

    // READ BY RESIDENT
    @GetMapping("/resident/{residentId}")
    public List<MealOptOut> getOptOutsByResident(
            @PathVariable Long residentId) {

        return mealOptOutService.getOptOutsByResident(residentId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public MealOptOut updateOptOut(
            @PathVariable Long id,
            @Valid @RequestBody MealOptOut optOut) {

        return mealOptOutService.updateOptOut(id, optOut);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteOptOut(@PathVariable Long id) {

        mealOptOutService.deleteOptOut(id);

        return "Meal opt-out deleted successfully";
    }
}