package com.messmate.repository;

import com.messmate.entity.MealOptOut;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealOptOutRepository
        extends JpaRepository<MealOptOut, Long> {

    boolean existsByResidentIdAndOptOutDate(
            Long residentId,
            LocalDate optOutDate
    );

    List<MealOptOut> findByResidentId(Long residentId);

    List<MealOptOut> findByOptOutDate(LocalDate optOutDate);

    long countByOptOutDate(LocalDate optOutDate);
}