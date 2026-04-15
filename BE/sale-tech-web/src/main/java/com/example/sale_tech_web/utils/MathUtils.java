package com.example.sale_tech_web.utils;

public class MathUtils {
    public static long safeLong(Number value) {
        return value == null ? 0L : value.longValue();
    }

    public static double calculateRate(long numerator, long denominator) {
        if (denominator <= 0L) {
            return 0D;
        }
        return Math.round((numerator * 10000.0D) / denominator) / 100.0D;
    }

    public static double calculateGrowth(long currentValue, long previousValue) {
        if (previousValue == 0L) {
            return currentValue > 0L ? 100D : 0D;
        }
        return Math.round(((currentValue - previousValue) * 10000.0D) / previousValue) / 100.0D;
    }
}
