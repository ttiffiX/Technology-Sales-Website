package com.example.sale_tech_web.feature.user_address.manager;

import com.example.sale_tech_web.feature.user_address.dto.AddressResponse;
import com.example.sale_tech_web.feature.user_address.dto.AddressRequest;

import java.util.List;

public interface UserAddressServiceInterface {
    List<AddressResponse> getAllAddresses();

    AddressResponse getAddressById(Long id);

    AddressResponse createAddress(AddressRequest request);

    AddressResponse updateAddress(Long id, AddressRequest request);

    String deleteAddress(Long id);

    AddressResponse setDefaultAddress(Long id);
}

