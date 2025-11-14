package com.example.sale_tech_web.feature.users.manager;

import com.example.sale_tech_web.controller.request.LogInRequest;
import com.example.sale_tech_web.controller.request.RegisterRequest;
import com.example.sale_tech_web.controller.response.LogInResponse;

public interface UserServiceInterface {
    LogInResponse login(LogInRequest logInRequest);
    String createUser(RegisterRequest registerRequest);
}
