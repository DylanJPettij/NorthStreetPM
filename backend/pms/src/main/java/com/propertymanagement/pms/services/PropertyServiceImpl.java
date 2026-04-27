package com.propertymanagement.pms.services;

import com.propertymanagement.pms.entities.PropertyEO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.propertymanagement.pms.persistence.PropertyDAO;

import java.util.List;

@Service
public class PropertyServiceImpl implements PropertyService {

    @Autowired
    public PropertyDAO propertyDAO;

    @Override
    public List<PropertyEO> getProperties(String ownerId) {
        List<PropertyEO> properties = propertyDAO.getProperties(ownerId);

        return properties;
    };
}
