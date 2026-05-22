package com.example.sale_tech_web.controller.pm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pm/product-reviews")
@Slf4j
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public class ProductReviewsController {



}

