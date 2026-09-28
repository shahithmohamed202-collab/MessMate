package com.messmate.repository;

import com.messmate.entity.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {

    List<Meal> findByMealDate(LocalDate mealDate);

    List<Meal> findByMealType(String mealType);

    List<Meal> findByMealDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}