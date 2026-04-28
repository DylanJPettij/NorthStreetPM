package com.propertymanagement.pms.repositories;

import com.propertymanagement.pms.entities.UserEO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

// Repository interface — no implementation needed, Hibernate handles it
@Repository
public interface UserRepository extends JpaRepository<UserEO, UUID> {
    // Spring generates the SQL automatically
}