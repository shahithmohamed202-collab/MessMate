package com.messmate.service;

import com.messmate.entity.Resident;
import com.messmate.repository.ResidentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResidentService {

    private final ResidentRepository residentRepository;

    public ResidentService(ResidentRepository residentRepository) {
        this.residentRepository = residentRepository;
    }

    public Resident createResident(Resident resident) {

        if (resident.getId() == null) {
            throw new IllegalArgumentException(
                    "Resident ID is required"
            );
        }

        if (residentRepository.existsById(resident.getId())) {
            throw new IllegalArgumentException(
                    "Resident with ID "
                            + resident.getId()
                            + " already exists"
            );
        }

        return residentRepository.save(resident);
    }

    public List<Resident> getAllResidents() {

        return residentRepository.findAll();
    }

    public Resident getResidentById(Long id) {

        return residentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resident not found with id: " + id
                        )
                );
    }

    public Resident updateResident(
            Long id,
            Resident updatedResident) {

        Resident existing =
                getResidentById(id);

        existing.setName(
                updatedResident.getName()
        );

        existing.setRoomNumber(
                updatedResident.getRoomNumber()
        );

        return residentRepository.save(existing);
    }

    public void deleteResident(Long id) {

        Resident existing =
                getResidentById(id);

        residentRepository.delete(existing);
    }
}