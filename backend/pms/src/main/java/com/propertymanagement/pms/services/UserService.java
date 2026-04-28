package com.propertymanagement.pms.services;

import com.propertymanagement.pms.entities.UserEO;

public interface UserService {

    UserEO getCurrentUserInformation(String userId);

}
