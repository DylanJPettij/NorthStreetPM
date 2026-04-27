package com.propertymanagement.pms.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "properties")
public class PropertyEO {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID propertyId;

    @Column(nullable = false)
    private String address1;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String zip;

    private Integer unitCount;
    private Integer yearBuilt;
    private String propertyType;

    @Column(nullable = false)
    private UUID companyId;
}
