package com.messmate.service;

import com.messmate.entity.Meal;
import com.messmate.repository.FeedbackRepository;
import com.messmate.repository.MealRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;
    private final FeedbackRepository feedbackRepository;

    public MealService(
            MealRepository mealRepository,
            FeedbackRepository feedbackRepository) {

        this.mealRepository = mealRepository;
        this.feedbackRepository = feedbackRepository;
    }

    // CREATE
    public Meal createMeal(Meal meal) {

        meal.setId(null);

        return mealRepository.save(meal);
    }

    // READ ALL
    public List<Meal> getAllMeals() {

        return mealRepository.findAll();
    }

    // READ ONE
    public Meal getMealById(Long id) {

        return mealRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Meal not found with id: " + id));
    }

    // FIND BY DATE
    public List<Meal> getMealsByDate(LocalDate date) {

        return mealRepository.findByMealDate(date);
    }

    // FIND BY TYPE
    public List<Meal> getMealsByType(String mealType) {

        return mealRepository.findByMealType(mealType);
    }

    // UPDATE
    public Meal updateMeal(
            Long id,
            Meal updatedMeal) {

        Meal existing = getMealById(id);

        existing.setMealDate(updatedMeal.getMealDate());
        existing.setMealType(updatedMeal.getMealType());
        existing.setDescription(updatedMeal.getDescription());
        existing.setMenuItem(updatedMeal.getMenuItem());

        return mealRepository.save(existing);
    }

    // DELETE
    public void deleteMeal(Long id) {

        Meal existing = getMealById(id);

        // Prevent deletion if feedback records exist
        if (!feedbackRepository
                .findByMealId(id)
                .isEmpty()) {

            throw new IllegalArgumentException(
                    "Cannot delete meal because feedback records exist for this meal.");
        }

        mealRepository.delete(existing);
    }
}