package com.propertymanagement.pms.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;
@Data
@Entity
@Table(name = "residents")
public class ResidentEO{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "resident_id")
    private UUID residentId;

    @Column(nullable = false, name = "first_name")
    private String firstName;

    @Column(nullable = false, name = "last_name")
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    // Constructors
    public ResidentEO() {}

    public ResidentEO(String firstName, String lastName, String email, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }
}
