package com.messmate.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "menu_item")
public class MenuItem {

    @Id
    private Long id;

    @Column(nullable = false)
    private LocalDate weekStartDate;

    @Column(nullable = false)
    private LocalDate weekEndDate;

    public MenuItem() {
    }

    public MenuItem(
            Long id,
            LocalDate weekStartDate,
            LocalDate weekEndDate) {

        this.id = id;
        this.weekStartDate = weekStartDate;
        this.weekEndDate = weekEndDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(
            LocalDate weekStartDate) {

        this.weekStartDate =
                weekStartDate;
    }

    public LocalDate getWeekEndDate() {
        return weekEndDate;
    }

    public void setWeekEndDate(
            LocalDate weekEndDate) {

        this.weekEndDate =
                weekEndDate;
    }
}