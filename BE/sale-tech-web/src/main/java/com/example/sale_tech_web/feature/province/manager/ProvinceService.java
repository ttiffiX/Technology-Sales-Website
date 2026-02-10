package com.example.sale_tech_web.feature.province.manager;

import com.example.sale_tech_web.feature.province.entity.ProvinceData;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.example.sale_tech_web.utils.JsonDataReader.readJsonData;

@Service
public class ProvinceService {
    /**
     * Lấy tất cả dữ liệu tỉnh/thành phố
     */
    public List<ProvinceData> getAllProvinces() {
        return readJsonData("data.json", new TypeReference<List<ProvinceData>>() {
        });
    }

    /**
     * Tìm tỉnh/thành phố theo mã
     */
    public Optional<ProvinceData> getProvinceByCode(String provinceCode) {
        return getAllProvinces().stream()
                .filter(p -> p.getProvinceCode().equals(provinceCode))
                .findFirst();
    }

    /**
     * Tìm tỉnh/thành phố theo tên
     */
    public List<ProvinceData> searchProvincesByName(String name) {
        return getAllProvinces().stream()
                .filter(p -> p.getName().toLowerCase().contains(name.toLowerCase()))
                .collect(Collectors.toList());
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
        return getAllProvinces().stream()
                .flatMap(p -> p.getWards().stream())
                .filter(w -> w.getWardCode().equals(wardCode))
                .findFirst();
    }

    public String getProvinceNameByCode(String provinceCode) {
        return getProvinceByCode(provinceCode)
                .map(ProvinceData::getName)
                .orElse("Unknown Province");
    }

    public String getWardNameByCode(String wardCode) {
        return getWardByCode(wardCode)
                .map(ProvinceData.WardData::getName)
                .orElse("Unknown Ward");
    }
}

