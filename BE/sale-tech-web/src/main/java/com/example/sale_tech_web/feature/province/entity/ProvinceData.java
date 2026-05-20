package com.example.sale_tech_web.feature.province.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class ProvinceData {
    @JsonProperty("province_code")
    private String provinceCode;
    @JsonProperty("name")
    private String name;
    @JsonProperty("short_name")
    private String shortName;
    @JsonProperty("code")
    private String code;
    @JsonProperty("place_type")
    private String placeType;
    @JsonProperty("wards")
    private List<WardData> wards;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WardData {
        @JsonProperty("ward_code")
        private String wardCode;
        @JsonProperty("name")
        private String name;
        @JsonProperty("province_code")
        private String provinceCode;
    }
}

