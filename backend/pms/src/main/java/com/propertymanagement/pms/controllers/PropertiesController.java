package com.propertymanagement.pms.controllers;

import com.propertymanagement.pms.entities.PropertyEO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.propertymanagement.pms.services.PropertyService;

import java.util.List;

@RestController()
public class PropertiesController {
    @Autowired
    PropertyService propertyService;

    @GetMapping("/all")
    public List<PropertyEO> getProperties() {
        List<PropertyEO> properties = propertyService.getProperties("test");
        return properties;
    }
    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, Spring Boot!";
    }


}
