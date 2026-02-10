package com.example.sale_tech_web.feature.user_address.manager;

import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.province.manager.ProvinceService;
import com.example.sale_tech_web.feature.user_address.dto.AddressResponse;
import com.example.sale_tech_web.feature.user_address.dto.AddressRequest;
import com.example.sale_tech_web.feature.user_address.entity.UserAddress;
import com.example.sale_tech_web.feature.user_address.repository.UserAddressRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class UserAddressService implements UserAddressServiceInterface {
    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;
    private final ProvinceService provinceService;

    @Override
    public List<AddressResponse> getAllAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();

        List<UserAddress> addresses = userAddressRepository.findByUserId(userId);
        return addresses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AddressResponse getAddressById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();

        UserAddress address = userAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Address not found"));

        return convertToResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(AddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        boolean exists = userAddressRepository.existsByUserIdAndProvinceCodeAndWardCodeAndAddress(
                userId, request.getProvinceCode(), request.getWardCode(), request.getAddress());
        if (exists) throw new ResponseStatusException(BAD_REQUEST, "Address already exists");

        if (!provinceService.checkWardInProvince(request.getWardCode(), request.getProvinceCode())) {
            throw new ResponseStatusException(BAD_REQUEST, "Ward does not belong to the specified province");
        }

        // Nếu đây là địa chỉ đầu tiên hoặc được đánh dấu là default
        long addressCount = userAddressRepository.countByUserId(userId);
        boolean shouldBeDefault = (addressCount == 0) || request.isDefault();

        // Nếu địa chỉ mới là default, bỏ default của các địa chỉ cũ
        if (shouldBeDefault && addressCount > 0) {
            userAddressRepository.resetDefaultAddress(userId);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .provinceCode(request.getProvinceCode())
                .wardCode(request.getWardCode())
                .address(request.getAddress())
                .isDefault(shouldBeDefault)
                .label(request.getLabel())
                .build();

        userAddressRepository.save(address);
        return convertToResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long id, AddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        UserAddress address = userAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Address not found or does not belong to user"));

        boolean exists = userAddressRepository.existsByUserIdAndProvinceCodeAndWardCodeAndAddressAndIdNot(
                userId, request.getProvinceCode(), request.getWardCode(), request.getAddress(), id);
        if (exists) throw new ResponseStatusException(BAD_REQUEST, "Address already exists");

        if (!provinceService.checkWardInProvince(request.getWardCode(), request.getProvinceCode())) {
            throw new ResponseStatusException(BAD_REQUEST, "Ward does not belong to the specified province");
        }

        address.setProvinceCode(request.getProvinceCode());
        address.setWardCode(request.getWardCode());
        address.setAddress(request.getAddress());
        address.setLabel(request.getLabel());

        userAddressRepository.save(address);
        return convertToResponse(address);
    }

    @Override
    @Transactional
    public String deleteAddress(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();

        UserAddress address = userAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Address not found"));

        boolean wasDefault = address.isDefault();
        userAddressRepository.delete(address);

        // Nếu địa chỉ bị xóa là default, đặt địa chỉ đầu tiên còn lại làm default
        if (wasDefault) {
            userAddressRepository.findFirstByUserIdOrderByIdAsc(userId)
                    .ifPresent(firstAddress -> {
                        firstAddress.setDefault(true);
                        userAddressRepository.save(firstAddress);
                    });
        }
        return "Address deleted successfully";
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();

        UserAddress address = userAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Address not found or does not belong to user"));

        // Bỏ default của tất cả địa chỉ khác
        userAddressRepository.resetDefaultAddress(userId);

        // Đặt địa chỉ này là default
        address.setDefault(true);
        UserAddress updatedAddress = userAddressRepository.save(address);

        return convertToResponse(updatedAddress);
    }

    private AddressResponse convertToResponse(UserAddress address) {
        String provinceName = provinceService.getProvinceNameByCode(address.getProvinceCode());
        String wardName = provinceService.getWardNameByCode(address.getWardCode());

        return AddressResponse.builder()
                .id(address.getId())
                .provinceCode(address.getProvinceCode())
                .provinceName(provinceName)
                .wardName(wardName)
                .wardCode(address.getWardCode())
                .address(address.getAddress())
                .isDefault(address.isDefault())
                .label(address.getLabel())
                .build();
    }
}

