package com.example.sale_tech_web.feature.users.manager;

import com.example.sale_tech_web.feature.users.dto.ChangePassRequest;
import com.example.sale_tech_web.feature.users.dto.LogInRequest;
import com.example.sale_tech_web.feature.users.dto.RegisterRequest;
import com.example.sale_tech_web.feature.users.dto.LogInResponse;

public interface UserServiceInterface {
    LogInResponse login(LogInRequest logInRequest);

    String createUser(RegisterRequest registerRequest);

    String changePassword(ChangePassRequest changePassRequest);
}
