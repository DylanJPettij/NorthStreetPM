package com.propertymanagement.pms.persistence;

import com.propertymanagement.pms.entities.UserEO;
import com.propertymanagement.pms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public class UserDAOImpl implements UserDAO {
    @Autowired
    UserRepository userRepository;

    public UserEO getCurrentUserInformation(String userId){
        return userId.isBlank() ? null :
                userRepository.getReferenceById(UUID.fromString(userId));
    }
}
