package com.messmate.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resident")
public class Resident {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String roomNumber;

    public Resident() {
    }

    public Resident(Long id, String name, String roomNumber) {
        this.id = id;
        this.name = name;
        this.roomNumber = roomNumber;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
}