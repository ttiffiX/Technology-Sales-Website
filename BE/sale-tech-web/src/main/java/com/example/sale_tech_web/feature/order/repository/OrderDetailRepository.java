package com.example.sale_tech_web.feature.order.repository;

import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {}
