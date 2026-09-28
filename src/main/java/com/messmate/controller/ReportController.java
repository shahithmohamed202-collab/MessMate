package com.messmate.controller;

import com.messmate.dto.DailyRatingReport;
import com.messmate.dto.DailyReport;
import com.messmate.dto.MealRatingReport;
import com.messmate.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService
    ) {
        this.reportService = reportService;
    }


    /*
     * =====================================================
     * 1. AVERAGE RATING PER MEAL
     * =====================================================
     *
     * GET /api/reports/meal-averages
     */

    @GetMapping("/meal-averages")
    public ResponseEntity<List<MealRatingReport>>
    getAverageRatingPerMeal() {

        return ResponseEntity.ok(
                reportService.getAverageRatingPerMeal()
        );
    }


    /*
     * =====================================================
     * 2. AVERAGE RATING PER DAY
     * =====================================================
     *
     * GET /api/reports/daily-averages
     *
     * Example:
     * /api/reports/daily-averages
     * ?startDate=2026-09-28
     * &endDate=2026-10-04
     */

    @GetMapping("/daily-averages")
    public ResponseEntity<List<DailyRatingReport>>
    getAverageRatingPerDay(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate

    ) {

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date."
            );
        }

        return ResponseEntity.ok(
                reportService.getAverageRatingPerDay(
                        startDate,
                        endDate
                )
        );
    }


    /*
     * =====================================================
     * 3. LOW-RATED MEALS
     * =====================================================
     *
     * Default threshold = 3.0
     *
     * GET /api/reports/low-rated
     */

    @GetMapping("/low-rated")
    public ResponseEntity<List<MealRatingReport>>
    getLowRatedMeals(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(defaultValue = "3.0")
            double threshold

    ) {

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date."
            );
        }

        if (threshold < 1 || threshold > 5) {

            throw new IllegalArgumentException(
                    "Rating threshold must be between 1 and 5."
            );
        }

        return ResponseEntity.ok(
                reportService.getLowRatedMeals(
                        startDate,
                        endDate,
                        threshold
                )
        );
    }


    /*
     * =====================================================
     * 4. DAILY REPORT
     * =====================================================
     *
     * GET /api/reports/daily/{date}
     */

    @GetMapping("/daily/{date}")
    public ResponseEntity<DailyReport>
    getDailyReport(

            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date

    ) {

        return ResponseEntity.ok(
                reportService.getDailyReport(date)
        );
    }
}