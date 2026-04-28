package com.propertymanagement.pms.services;


import com.propertymanagement.pms.entities.UserEO;
import com.propertymanagement.pms.persistence.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDAO UserDAO;

    @Override
    public UserEO getCurrentUserInformation(String userId){
        return UserDAO.getCurrentUserInformation(userId);
    }


}
