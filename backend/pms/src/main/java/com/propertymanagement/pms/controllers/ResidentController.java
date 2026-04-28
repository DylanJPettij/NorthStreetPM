package com.propertymanagement.pms.controllers;

import com.propertymanagement.pms.services.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/resident")
public class ResidentController {
    @Autowired
    private ResidentService residentService;

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, Spring Boot!";
    }

    @GetMapping("/all")
    public Optional<?> getResidents() {
        return Optional.of(residentService.getResidents());
    }
}
