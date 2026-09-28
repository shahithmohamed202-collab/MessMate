package com.messmate.service;

import com.messmate.entity.MealOptOut;
import com.messmate.repository.MealOptOutRepository;
import com.messmate.repository.ResidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MealOptOutService {

    private final MealOptOutRepository mealOptOutRepository;
    private final ResidentRepository residentRepository;

    public MealOptOutService(
            MealOptOutRepository mealOptOutRepository,
            ResidentRepository residentRepository) {

        this.mealOptOutRepository = mealOptOutRepository;
        this.residentRepository = residentRepository;
    }

    // CREATE
    public MealOptOut createOptOut(MealOptOut optOut) {

        if (optOut.getResident() == null ||
                optOut.getResident().getId() == null) {

            throw new IllegalArgumentException(
                    "Resident is required");
        }

        Long residentId = optOut.getResident().getId();

        LocalDate date = optOut.getOptOutDate();

        if (date == null) {
            throw new IllegalArgumentException(
                    "Opt-out date is required");
        }

        // Verify resident
        residentRepository.findById(residentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resident not found with id: " + residentId));

        // BUSINESS RULE
        if (mealOptOutRepository
                .existsByResidentIdAndOptOutDate(
                        residentId,
                        date)) {

            throw new IllegalArgumentException(
                    "Resident has already opted out for this date.");
        }

        optOut.setId(null);

        return mealOptOutRepository.save(optOut);
    }

    // READ ALL
    public List<MealOptOut> getAllOptOuts() {
        return mealOptOutRepository.findAll();
    }

    // READ ONE
    public MealOptOut getOptOutById(Long id) {

        return mealOptOutRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Opt-out record not found with id: " + id));
    }

    // READ BY RESIDENT
    public List<MealOptOut> getOptOutsByResident(Long residentId) {

        return mealOptOutRepository.findByResidentId(residentId);
    }

    // UPDATE
    public MealOptOut updateOptOut(
            Long id,
            MealOptOut updatedOptOut) {

        MealOptOut existing = getOptOutById(id);

        existing.setOptOutDate(updatedOptOut.getOptOutDate());

        return mealOptOutRepository.save(existing);
    }

    // DELETE
    public void deleteOptOut(Long id) {

        MealOptOut existing = getOptOutById(id);

        mealOptOutRepository.delete(existing);
    }
}