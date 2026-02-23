package com.example.sale_tech_web.feature.province.manager;

import com.example.sale_tech_web.feature.province.entity.ProvinceData;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.example.sale_tech_web.utils.JsonDataReader.readJsonData;

@Service
@RequiredArgsConstructor
public class ProvinceService {
    private List<ProvinceData> provinceData;

    @PostConstruct
    private void init() {
        provinceData = readJsonData("data.json", new TypeReference<List<ProvinceData>>() {
        });
    }

    // Lấy tất cả tỉnh/thành phố nhưng không lấy ward
    public List<ProvinceData> getProvinceData() {
        return provinceData.stream()
                .map(p -> {
                    ProvinceData province = new ProvinceData();
                    province.setProvinceCode(p.getProvinceCode());
                    province.setName(p.getName());
                    province.setShortName(p.getShortName());
                    province.setCode(p.getCode());
                    province.setPlaceType(p.getPlaceType());
                    province.setWards(List.of()); // Không lấy ward
                    return province;
                })
                .collect(Collectors.toList());
    }

    /**
     * Tìm tỉnh/thành phố theo mã
     */
    public Optional<ProvinceData> getProvinceByCode(String provinceCode) {
        return provinceData.stream()
                .filter(p -> p.getProvinceCode().equals(provinceCode))
                .findFirst();
    }

    /**
     * Lấy danh sách phường/xã theo mã tỉnh/thành phố
     */
    public List<ProvinceData.WardData> getWardsByProvinceCode(String provinceCode) {
        return getProvinceByCode(provinceCode)
                .map(ProvinceData::getWards)
                .orElse(List.of());
    }

    /**
     * Tìm phường/xã theo mã
     */
    public Optional<ProvinceData.WardData> getWardByCode(String wardCode) {
        return provinceData.stream()
                .flatMap(p -> p.getWards().stream())
                .filter(w -> w.getWardCode().equals(wardCode))
                .findFirst();
    }

    public String getProvinceNameByCode(String provinceCode) {
        // Lấy tên tỉnh/thành phố theo mã
        return getProvinceByCode(provinceCode)
                .map(ProvinceData::getName)
                .orElse("Unknown Province");
    }

    public String getWardNameByCode(String wardCode) {
        return getWardByCode(wardCode)
                .map(ProvinceData.WardData::getName)
                .orElse("Unknown Ward");
    }

    public boolean checkWardInProvince(String wardCode, String provinceCode) {
        return getProvinceByCode(provinceCode)
                .map(province -> province.getWards().stream()
                        .anyMatch(ward -> ward.getWardCode().equals(wardCode)))
                .orElse(false);
    }
}

