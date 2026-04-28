package com.propertymanagement.pms.persistence;

import com.propertymanagement.pms.entities.UserEO;

public interface UserDAO {

    public UserEO getCurrentUserInformation(String userId);
}
