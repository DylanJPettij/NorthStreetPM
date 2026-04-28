package com.propertymanagement.pms.services;

import com.propertymanagement.pms.entities.PropertyEO;

import java.util.List;

public interface PropertyService {
    List<PropertyEO>  getProperties(String userId);
}
