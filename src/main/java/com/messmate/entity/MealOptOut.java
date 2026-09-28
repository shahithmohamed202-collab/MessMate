package com.messmate.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(
        name = "meal_opt_out",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_resident_date",
                        columnNames = {"resident_id", "opt_out_date"}
                )
        }
)
public class MealOptOut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    @NotNull(message = "Opt-out date is required")
    @Column(name = "opt_out_date")
    private LocalDate optOutDate;

    public MealOptOut() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Resident getResident() {
        return resident;
    }

    public void setResident(Resident resident) {
        this.resident = resident;
    }

    public LocalDate getOptOutDate() {
        return optOutDate;
    }

    public void setOptOutDate(LocalDate optOutDate) {
        this.optOutDate = optOutDate;
    }
}