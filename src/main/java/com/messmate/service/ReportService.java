package com.messmate.service;

import com.messmate.dto.DailyRatingReport;
import com.messmate.dto.DailyReport;
import com.messmate.dto.MealRatingReport;
import com.messmate.entity.Feedback;
import com.messmate.entity.Meal;
import com.messmate.entity.MealOptOut;
import com.messmate.repository.FeedbackRepository;
import com.messmate.repository.MealOptOutRepository;
import com.messmate.repository.MealRepository;
import com.messmate.repository.ResidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ReportService {

    private final MealRepository mealRepository;
    private final FeedbackRepository feedbackRepository;
    private final ResidentRepository residentRepository;
    private final MealOptOutRepository mealOptOutRepository;

    public ReportService(
            MealRepository mealRepository,
            FeedbackRepository feedbackRepository,
            ResidentRepository residentRepository,
            MealOptOutRepository mealOptOutRepository
    ) {
        this.mealRepository = mealRepository;
        this.feedbackRepository = feedbackRepository;
        this.residentRepository = residentRepository;
        this.mealOptOutRepository = mealOptOutRepository;
    }

    /*
     * =====================================================
     * AVERAGE RATING FOR EACH MEAL
     * =====================================================
     */

    public List<MealRatingReport> getAverageRatingPerMeal() {

        List<Meal> meals = mealRepository.findAll();

        List<MealRatingReport> reports = new ArrayList<>();

        for (Meal meal : meals) {

            List<Feedback> feedbackList =
                    feedbackRepository.findByMealId(meal.getId());

            double average = calculateAverage(feedbackList);

            reports.add(
                    new MealRatingReport(
                            meal.getId(),
                            meal.getMealDate().toString(),
                            meal.getMealType(),
                            meal.getDescription(),
                            average,
                            feedbackList.size()
                    )
            );
        }

        return reports;
    }


    /*
     * =====================================================
     * AVERAGE RATING FOR EACH DAY
     * =====================================================
     */

    public List<DailyRatingReport> getAverageRatingPerDay(
            LocalDate startDate,
            LocalDate endDate
    ) {

        List<Meal> meals =
                mealRepository.findByMealDateBetween(
                        startDate,
                        endDate
                );

        List<DailyRatingReport> reports =
                new ArrayList<>();

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            List<Feedback> dailyFeedback =
                    new ArrayList<>();

            for (Meal meal : meals) {

                if (meal.getMealDate().equals(currentDate)) {

                    dailyFeedback.addAll(
                            feedbackRepository.findByMealId(
                                    meal.getId()
                            )
                    );
                }
            }

            double average =
                    calculateAverage(dailyFeedback);

            reports.add(
                    new DailyRatingReport(
                            currentDate.toString(),
                            average,
                            dailyFeedback.size()
                    )
            );

            currentDate =
                    currentDate.plusDays(1);
        }

        return reports;
    }


    /*
     * =====================================================
     * LOW-RATED MEALS FOR A WEEK
     * =====================================================
     */

    public List<MealRatingReport> getLowRatedMeals(
            LocalDate startDate,
            LocalDate endDate,
            double threshold
    ) {

        List<Meal> meals =
                mealRepository.findByMealDateBetween(
                        startDate,
                        endDate
                );

        List<MealRatingReport> reports =
                new ArrayList<>();

        for (Meal meal : meals) {

            List<Feedback> feedbackList =
                    feedbackRepository.findByMealId(
                            meal.getId()
                    );

            /*
             * Do not consider a meal with no feedback
             * as low-rated.
             */
            if (feedbackList.isEmpty()) {
                continue;
            }

            double average =
                    calculateAverage(feedbackList);

            if (average <= threshold) {

                reports.add(
                        new MealRatingReport(
                                meal.getId(),
                                meal.getMealDate().toString(),
                                meal.getMealType(),
                                meal.getDescription(),
                                average,
                                feedbackList.size()
                        )
                );
            }
        }

        return reports;
    }


    /*
     * =====================================================
     * DAILY REPORT
     *
     * OPTED-OUT RESIDENTS ARE EXCLUDED
     * =====================================================
     */

    public DailyReport getDailyReport(
            LocalDate date
    ) {

        long totalResidents =
                residentRepository.count();

        List<MealOptOut> optOuts =
                mealOptOutRepository.findByOptOutDate(date);

        long optedOutResidents =
                optOuts.size();

        long activeResidents =
                Math.max(
                        0,
                        totalResidents - optedOutResidents
                );

        /*
         * Store opted-out resident IDs so their feedback
         * is excluded from the daily report.
         */

        Set<Long> optedOutResidentIds =
                new HashSet<>();

        for (MealOptOut optOut : optOuts) {

            if (optOut.getResident() != null &&
                    optOut.getResident().getId() != null) {

                optedOutResidentIds.add(
                        optOut.getResident().getId()
                );
            }
        }

        List<Meal> meals =
                mealRepository.findByMealDate(date);

        List<MealRatingReport> mealReports =
                new ArrayList<>();

        for (Meal meal : meals) {

            List<Feedback> feedbackList =
                    feedbackRepository.findByMealId(
                            meal.getId()
                    );

            /*
             * Remove feedback from residents who opted out
             * on this date.
             */

            List<Feedback> validFeedback =
                    new ArrayList<>();

            for (Feedback feedback : feedbackList) {

                if (feedback.getResident() == null) {
                    continue;
                }

                Long residentId =
                        feedback.getResident().getId();

                if (!optedOutResidentIds.contains(residentId)) {

                    validFeedback.add(feedback);
                }
            }

            double average =
                    calculateAverage(validFeedback);

            mealReports.add(
                    new MealRatingReport(
                            meal.getId(),
                            meal.getMealDate().toString(),
                            meal.getMealType(),
                            meal.getDescription(),
                            average,
                            validFeedback.size()
                    )
            );
        }

        return new DailyReport(
                date.toString(),
                totalResidents,
                optedOutResidents,
                activeResidents,
                mealReports
        );
    }


    /*
     * =====================================================
     * HELPER
     * =====================================================
     */

    private double calculateAverage(
            List<Feedback> feedbackList
    ) {

        if (feedbackList == null ||
                feedbackList.isEmpty()) {

            return 0.0;
        }

        double total = 0;

        for (Feedback feedback : feedbackList) {

            total += feedback.getRating();
        }

        double average =
                total / feedbackList.size();

        return Math.round(average * 100.0) / 100.0;
    }
}