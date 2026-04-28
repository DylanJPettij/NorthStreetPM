package com.propertymanagement.pms.controllers;

import com.propertymanagement.pms.persistence.UserDAOImpl;
import com.propertymanagement.pms.services.UserService;
import com.propertymanagement.pms.services.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService UserService;

@GetMapping("/{userId}")
public Optional<?> getCurrentUserInformation(@PathVariable String userId){

        return Optional.of(UserService.getCurrentUserInformation(userId));
}

}
