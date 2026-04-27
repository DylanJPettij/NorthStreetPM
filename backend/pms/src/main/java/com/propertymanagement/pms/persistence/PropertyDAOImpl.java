package com.propertymanagement.pms.persistence;

import com.propertymanagement.pms.entities.PropertyEO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.propertymanagement.pms.repositories.PropertyRepository;

import java.util.List;
import java.util.UUID;

@Repository
public class PropertyDAOImpl implements PropertyDAO {
    @Autowired
    private PropertyRepository propertyRepository;

    public List<PropertyEO> getProperties(String ownerId) {
        List<PropertyEO> properties = propertyRepository.findAll();
        return properties;
    }

    public void createProperty(PropertyEO propertyEO){
        propertyRepository.save(propertyEO);
    }
    public void updateProperty(PropertyEO propertyEO){
        propertyRepository.save(propertyEO);
    }
    public void deleteProperty(PropertyEO propertyEO){
        propertyRepository.delete(propertyEO);
    }
    public PropertyEO getPropertyById(String propertyId){
        return propertyRepository.getReferenceById(UUID.fromString(propertyId));
    }
}
