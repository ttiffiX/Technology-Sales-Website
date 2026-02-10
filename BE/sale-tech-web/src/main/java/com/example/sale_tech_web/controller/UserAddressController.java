package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.user_address.dto.AddressResponse;
import com.example.sale_tech_web.feature.user_address.dto.AddressRequest;
import com.example.sale_tech_web.feature.user_address.manager.UserAddressServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("address")
@RequiredArgsConstructor
@Slf4j
public class UserAddressController {
    private final UserAddressServiceInterface userAddressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAllAddresses() {
        log.info("Get all addresses for current user");
        List<AddressResponse> addresses = userAddressService.getAllAddresses();
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getAddressById(@PathVariable Long id) {
        log.info("Get address by ID {}", id);
        AddressResponse address = userAddressService.getAddressById(id);
        return ResponseEntity.ok(address);
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request) {
        log.info("Create new address");
        AddressResponse address = userAddressService.createAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(address);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        log.info("Update address by ID {}", id);
        AddressResponse address = userAddressService.updateAddress(id, request);
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(@PathVariable Long id) {
        log.info("Delete address by ID {}", id);
        String result = userAddressService.deleteAddress(id);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/set-default")
    public ResponseEntity<AddressResponse> setDefaultAddress(@PathVariable Long id) {
        log.info("Set address ID {} as default", id);
        AddressResponse address = userAddressService.setDefaultAddress(id);
        return ResponseEntity.ok(address);
    }
}

