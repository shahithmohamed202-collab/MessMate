package com.messmate.service;

import com.messmate.entity.Feedback;
import com.messmate.repository.FeedbackRepository;
import com.messmate.repository.MealRepository;
import com.messmate.repository.ResidentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ResidentRepository residentRepository;
    private final MealRepository mealRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            ResidentRepository residentRepository,
            MealRepository mealRepository) {

        this.feedbackRepository = feedbackRepository;
        this.residentRepository = residentRepository;
        this.mealRepository = mealRepository;
    }

    // CREATE
    public Feedback createFeedback(Feedback feedback) {

        if (feedback.getResident() == null ||
                feedback.getResident().getId() == null) {

            throw new IllegalArgumentException(
                    "Resident is required");
        }

        if (feedback.getMeal() == null ||
                feedback.getMeal().getId() == null) {

            throw new IllegalArgumentException(
                    "Meal is required");
        }

        Long residentId = feedback.getResident().getId();
        Long mealId = feedback.getMeal().getId();

        // Verify resident exists
        residentRepository.findById(residentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resident not found with id: " + residentId));

        // Verify meal exists
        mealRepository.findById(mealId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Meal not found with id: " + mealId));

        // BUSINESS RULE
        if (feedbackRepository
                .existsByResidentIdAndMealId(residentId, mealId)) {

            throw new IllegalArgumentException(
                    "This resident has already submitted feedback for this meal.");
        }

        feedback.setId(null);

        return feedbackRepository.save(feedback);
    }

    // READ ALL
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    // READ ONE
    public Feedback getFeedbackById(Long id) {

        return feedbackRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Feedback not found with id: " + id));
    }

    // READ BY MEAL
    public List<Feedback> getFeedbackByMeal(Long mealId) {
        return feedbackRepository.findByMealId(mealId);
    }

    // READ BY RESIDENT
    public List<Feedback> getFeedbackByResident(Long residentId) {
        return feedbackRepository.findByResidentId(residentId);
    }

    // UPDATE
    public Feedback updateFeedback(
            Long id,
            Feedback updatedFeedback) {

        Feedback existing = getFeedbackById(id);

        existing.setRating(updatedFeedback.getRating());
        existing.setComment(updatedFeedback.getComment());

        return feedbackRepository.save(existing);
    }

    // DELETE
    public void deleteFeedback(Long id) {

        Feedback existing = getFeedbackById(id);

        feedbackRepository.delete(existing);
    }
}