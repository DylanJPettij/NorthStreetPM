package com.propertymanagement.pms.persistence;

import com.propertymanagement.pms.entities.PropertyEO;

import java.util.List;

public interface PropertyDAO {
    public List<PropertyEO> getProperties(String ownerId);
    public void createProperty(PropertyEO propertyEO);
    public void updateProperty(PropertyEO propertyEO);
    public void deleteProperty(PropertyEO propertyEO);
    public PropertyEO getPropertyById(String propertyId);


}
