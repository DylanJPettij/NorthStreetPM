package com.propertymanagement.pms.persistence;

import com.propertymanagement.pms.entities.ResidentEO;
import com.propertymanagement.pms.repositories.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ResidentDAOImpl implements ResidentDAO {
    @Autowired
    private ResidentRepository residentRepository;

    public List<ResidentEO> getResidents() {
        return residentRepository.findAll();
    }
}
