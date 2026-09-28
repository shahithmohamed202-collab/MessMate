package com.messmate.dto;

public class DailyRatingReport {

    private String date;
    private double averageRating;
    private long feedbackCount;

    public DailyRatingReport() {
    }

    public DailyRatingReport(
            String date,
            double averageRating,
            long feedbackCount
    ) {
        this.date = date;
        this.averageRating = averageRating;
        this.feedbackCount = feedbackCount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
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