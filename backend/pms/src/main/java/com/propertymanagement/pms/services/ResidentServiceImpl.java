package com.propertymanagement.pms.services;

import com.propertymanagement.pms.entities.ResidentEO;
import com.propertymanagement.pms.persistence.ResidentDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ResidentServiceImpl implements ResidentService {
    @Autowired
    ResidentDAO  residentDAO;
    @Override
    public List<ResidentEO>  getResidents() {
        return residentDAO.getResidents();
    }
}
