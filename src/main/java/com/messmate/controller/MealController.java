package com.messmate.controller;

import com.messmate.entity.Meal;
import com.messmate.service.MealService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    // CREATE
    @PostMapping
    public Meal createMeal(
            @Valid @RequestBody Meal meal) {

        return mealService.createMeal(meal);
    }

    // READ ALL
    @GetMapping
    public List<Meal> getAllMeals() {
        return mealService.getAllMeals();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Meal getMealById(@PathVariable Long id) {
        return mealService.getMealById(id);
    }

    // FIND BY DATE
    @GetMapping("/date/{date}")
    public List<Meal> getMealsByDate(
            @PathVariable LocalDate date) {

        return mealService.getMealsByDate(date);
    }

    // FIND BY TYPE
    @GetMapping("/type/{mealType}")
    public List<Meal> getMealsByType(
            @PathVariable String mealType) {

        return mealService.getMealsByType(mealType);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Meal updateMeal(
            @PathVariable Long id,
            @Valid @RequestBody Meal meal) {

        return mealService.updateMeal(id, meal);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteMeal(@PathVariable Long id) {

        mealService.deleteMeal(id);

        return "Meal deleted successfully";
    }
}