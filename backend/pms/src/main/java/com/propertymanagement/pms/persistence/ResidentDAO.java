package com.propertymanagement.pms.persistence;

import com.propertymanagement.pms.entities.ResidentEO;

import java.util.List;

public interface ResidentDAO {
    public List<ResidentEO> getResidents();
}
