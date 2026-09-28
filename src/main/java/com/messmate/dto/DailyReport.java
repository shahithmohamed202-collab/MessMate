package com.messmate.dto;

import java.util.List;

public class DailyReport {

    private String date;
    private long totalResidents;
    private long optedOutResidents;
    private long activeResidents;
    private List<MealRatingReport> meals;

    public DailyReport() {
    }

    public DailyReport(
            String date,
            long totalResidents,
            long optedOutResidents,
            long activeResidents,
            List<MealRatingReport> meals
    ) {
        this.date = date;
        this.totalResidents = totalResidents;
        this.optedOutResidents = optedOutResidents;
        this.activeResidents = activeResidents;
        this.meals = meals;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getTotalResidents() {
        return totalResidents;
    }

    public void setTotalResidents(long totalResidents) {
        this.totalResidents = totalResidents;
    }

    public long getOptedOutResidents() {
        return optedOutResidents;
    }

    public void setOptedOutResidents(long optedOutResidents) {
        this.optedOutResidents = optedOutResidents;
    }

    public long getActiveResidents() {
        return activeResidents;
    }

    public void setActiveResidents(long activeResidents) {
        this.activeResidents = activeResidents;
    }

    public List<MealRatingReport> getMeals() {
        return meals;
    }

    public void setMeals(List<MealRatingReport> meals) {
        this.meals = meals;
    }
}