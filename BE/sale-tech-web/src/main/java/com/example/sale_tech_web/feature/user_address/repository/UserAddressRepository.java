package com.example.sale_tech_web.feature.user_address.repository;

import com.example.sale_tech_web.feature.user_address.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserId(Long userId);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndProvinceCodeAndWardCodeAndAddress(
            Long userId, String provinceCode, String wardCode, String address
    );

    @Modifying(clearAutomatically = true)
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user.id = :userId")
    void resetDefaultAddress(@Param("userId") Long userId);

    boolean existsByUserIdAndProvinceCodeAndWardCodeAndAddressAndIdNot(
            Long userId, String provinceCode, String wardCode, String address, Long id
    );

    Optional<UserAddress> findFirstByUserIdOrderByIdAsc(Long userId);
}

