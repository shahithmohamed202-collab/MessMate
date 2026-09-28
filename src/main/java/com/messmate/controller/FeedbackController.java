package com.messmate.controller;

import com.messmate.entity.Feedback;
import com.messmate.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // CREATE
    @PostMapping
    public Feedback createFeedback(
            @Valid @RequestBody Feedback feedback) {

        return feedbackService.createFeedback(feedback);
    }

    // READ ALL
    @GetMapping
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Feedback getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id);
    }

    // READ BY MEAL
    @GetMapping("/meal/{mealId}")
    public List<Feedback> getFeedbackByMeal(
            @PathVariable Long mealId) {

        return feedbackService.getFeedbackByMeal(mealId);
    }

    // READ BY RESIDENT
    @GetMapping("/resident/{residentId}")
    public List<Feedback> getFeedbackByResident(
            @PathVariable Long residentId) {

        return feedbackService.getFeedbackByResident(residentId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Feedback updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody Feedback feedback) {

        return feedbackService.updateFeedback(id, feedback);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteFeedback(@PathVariable Long id) {

        feedbackService.deleteFeedback(id);

        return "Feedback deleted successfully";
    }
}