package com.messmate.repository;

import com.messmate.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    boolean existsByResidentIdAndMealId(Long residentId, Long mealId);

    List<Feedback> findByMealId(Long mealId);

    List<Feedback> findByResidentId(Long residentId);
}