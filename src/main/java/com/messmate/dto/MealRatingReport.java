package com.messmate.dto;

public class MealRatingReport {

    private Long mealId;
    private String mealDate;
    private String mealType;
    private String description;
    private double averageRating;
    private long feedbackCount;

    public MealRatingReport() {
    }

    public MealRatingReport(
            Long mealId,
            String mealDate,
            String mealType,
            String description,
            double averageRating,
            long feedbackCount
    ) {
        this.mealId = mealId;
        this.mealDate = mealDate;
        this.mealType = mealType;
        this.description = description;
        this.averageRating = averageRating;
        this.feedbackCount = feedbackCount;
    }

    public Long getMealId() {
        return mealId;
    }

    public void setMealId(Long mealId) {
        this.mealId = mealId;
    }

    public String getMealDate() {
        return mealDate;
    }

    public void setMealDate(String mealDate) {
        this.mealDate = mealDate;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getFeedbackCount() {
        return feedbackCount;
    }

    public void setFeedbackCount(long feedbackCount) {
        this.feedbackCount = feedbackCount;
    }
}