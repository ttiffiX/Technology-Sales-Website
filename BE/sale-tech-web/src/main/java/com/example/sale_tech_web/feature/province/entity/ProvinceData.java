package com.example.sale_tech_web.feature.province.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class ProvinceData {
    private String provinceCode;
    private String name;
    private String shortName;
    private String code;
    private String placeType;
    private List<WardData> wards;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WardData {
        private String wardCode;
        private String name;
        private String provinceCode;
    }
}

