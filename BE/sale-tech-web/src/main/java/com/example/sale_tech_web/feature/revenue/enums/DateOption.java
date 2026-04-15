package com.example.sale_tech_web.feature.revenue.enums;

import com.example.sale_tech_web.feature.revenue.dto.DateRangeDTO;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

public enum DateOption {
    TODAY {
        @Override
        protected DateRangeDTO buildRange(LocalDate today) {
            return new DateRangeDTO(today, today, TODAY.name());
        }

        @Override
        protected DateRangeDTO buildPreviousRange(LocalDate today) {
            LocalDate previous = today.minusDays(1);
            return new DateRangeDTO(previous, previous, "PREVIOUS_" + TODAY.name());
        }
    },
    THIS_WEEK {
        @Override
        protected DateRangeDTO buildRange(LocalDate today) {
            LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            return new DateRangeDTO(start, end, THIS_WEEK.name());
        }

        @Override
        protected DateRangeDTO buildPreviousRange(LocalDate today) {
            LocalDate currentStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate previousStart = currentStart.minusWeeks(1);
            LocalDate previousEnd = previousStart.plusDays(6);
            return new DateRangeDTO(previousStart, previousEnd, "PREVIOUS_" + THIS_WEEK.name());
        }
    },
    THIS_MONTH {
        @Override
        protected DateRangeDTO buildRange(LocalDate today) {
            LocalDate start = today.withDayOfMonth(1);
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth());
            return new DateRangeDTO(start, end, THIS_MONTH.name());
        }

        @Override
        protected DateRangeDTO buildPreviousRange(LocalDate today) {
            LocalDate currentStart = today.withDayOfMonth(1);
            LocalDate previousStart = currentStart.minusMonths(1).withDayOfMonth(1);
            LocalDate previousEnd = previousStart.with(TemporalAdjusters.lastDayOfMonth());
            return new DateRangeDTO(previousStart, previousEnd, "PREVIOUS_" + THIS_MONTH.name());
        }
    },
    THIS_YEAR {
        @Override
        protected DateRangeDTO buildRange(LocalDate today) {
            LocalDate start = today.withDayOfYear(1);
            LocalDate end = today.with(TemporalAdjusters.lastDayOfYear());
            return new DateRangeDTO(start, end, THIS_YEAR.name());
        }

        @Override
        protected DateRangeDTO buildPreviousRange(LocalDate today) {
            LocalDate currentStart = today.withDayOfYear(1);
            LocalDate previousStart = currentStart.minusYears(1).withDayOfYear(1);
            LocalDate previousEnd = previousStart.with(TemporalAdjusters.lastDayOfYear());
            return new DateRangeDTO(previousStart, previousEnd, "PREVIOUS_" + THIS_YEAR.name());
        }
    };

    protected abstract DateRangeDTO buildRange(LocalDate today);
    protected abstract DateRangeDTO buildPreviousRange(LocalDate today);

    public DateRangeDTO resolveDateRange() {
        return buildRange(LocalDate.now());
    }

    public DateRangeDTO resolvePreviousRange() {
        LocalDate today = LocalDate.now();
        return buildPreviousRange(today);
    }

    public static DateRangeDTO resolveDateRange(DateOption dateOption) {
        DateOption safeOption = dateOption == null ? THIS_MONTH : dateOption;
        return safeOption.resolveDateRange();
    }

    public static DateRangeDTO resolvePreviousRange(DateOption dateOption) {
        DateOption safeOption = dateOption == null ? THIS_MONTH : dateOption;
        return safeOption.resolvePreviousRange();
    }
}
