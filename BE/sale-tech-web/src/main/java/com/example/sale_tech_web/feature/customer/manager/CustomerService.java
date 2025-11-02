package com.example.sale_tech_web.feature.customer.manager;

import com.example.sale_tech_web.controller.exception.ClientException;
import com.example.sale_tech_web.feature.customer.entity.Customer;
import com.example.sale_tech_web.feature.customer.repository.CustomerRepository;
import com.example.sale_tech_web.feature.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerService {
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final JwtUtils jwtUtils;

    public String login(String userName, String password) {
        Customer customer = customerRepository.findByUserName(userName).orElseThrow(() -> new ClientException("User not found"));
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new ClientException("Wrong password");
        }

        return jwtUtils.generateToken(userName);
    }

    public String register(String userName, String password, String email) {
        if (customerRepository.existsByUserName(userName) || customerRepository.existsByEmail(email)) {
            throw new ClientException("User already exists");
        }
        Customer customer = Customer.builder()
                .userName(userName)
                .password(passwordEncoder.encode(password))
                .email(email)
                .name(userName)
                .role("Customer")
                .build();
        customerRepository.save(customer);
        return "Register Successfully";
    }
}
