package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.province.entity.ProvinceData;
import com.example.sale_tech_web.feature.province.manager.ProvinceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/province")
@RequiredArgsConstructor
@Slf4j
public class ProvinceController {
    private final ProvinceService provinceService;

    @GetMapping
    public ResponseEntity<List<ProvinceData>> getAllProvinces() {
        log.info("Get all provinces");
        List<ProvinceData> provinces = provinceService.getProvinceData();
        return ResponseEntity.ok(provinces);
    }

    @GetMapping("/{provinceCode}/wards")
    public ResponseEntity<List<ProvinceData.WardData>> getWardsByProvinceCode(@PathVariable String provinceCode) {
        log.info("Get wards by province code: {}", provinceCode);
        List<ProvinceData.WardData> wards = provinceService.getWardsByProvinceCode(provinceCode);
        return ResponseEntity.ok(wards);
    }
}

