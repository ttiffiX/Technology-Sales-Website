import {
    getCategoryRevenue,
    getDailyRevenue,
    getPendingRevenue,
    getRevenueByPaymentMethod,
    getRevenueCancelRate,
    getRevenueTotal,
    getTopProducts,
} from '../api/admin/RevenueAPI';

export const REVENUE_DATE_OPTIONS = [
    { value: 'TODAY', label: 'Today' },
    { value: 'THIS_WEEK', label: 'This week' },
    { value: 'THIS_MONTH', label: 'This month' },
    { value: 'THIS_YEAR', label: 'This year' },
];

export const REVENUE_SORT_OPTIONS = [
    { value: 'REVENUE', label: 'Top by revenue' },
    { value: 'QUANTITY', label: 'Top by quantity' },
];

export const REVENUE_PIE_COLORS = [
    '#2563EB',
    '#7C3AED',
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
];

export const getTodayInputValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const toApiDate = (date) => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const buildApiParams = (params = {}) => {
    const normalized = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            normalized[key] = value;
        }
    });
    return normalized;
};

export const safeNumber = (value) => Number(value || 0);

export const formatPercent = (value) => `${safeNumber(value).toFixed(2)}%`;

export const formatCompactNumber = (value) =>
    new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(safeNumber(value));

export const normalizeCategories = (data) => {
    const list = Array.isArray(data) ? data : data?.content || [];
    return [
        { id: '', name: 'All categories' },
        ...list.map((item) => ({
            id: item.id ?? item.categoryId ?? '',
            name: item.name ?? item.categoryName ?? item.label ?? `Category ${item.id ?? item.categoryId ?? ''}`,
        })),
    ];
};

export const loadRevenueDashboardData = async ({ dateOption, categoryId, sortBy, dailyDate }) => {
    const commonParams = buildApiParams({ dateOption });
    const topParams = buildApiParams({ dateOption, categoryId, sortBy });
    const dailyParams = buildApiParams({ date: toApiDate(dailyDate) });
    const paymentParams = buildApiParams({ dateOption, categoryId });

    const [
        totalRevenue,
        pendingRevenue,
        cancelRate,
        dailyRevenue,
        categoryRevenue,
        topProducts,
        paymentMethodRevenue,
    ] = await Promise.all([
        getRevenueTotal(commonParams),
        getPendingRevenue(),
        getRevenueCancelRate(commonParams),
        getDailyRevenue(dailyParams),
        getCategoryRevenue(commonParams),
        getTopProducts(topParams),
        getRevenueByPaymentMethod(paymentParams),
    ]);

    return {
        totalRevenue,
        pendingRevenue,
        cancelRate,
        dailyRevenue,
        categoryRevenue,
        topProducts,
        paymentMethodRevenue,
    };
};

export const normalizeDailySeries = (data = []) => {
    const map = new Map(data.map((item) => [safeNumber(item.hour), item]));
    return Array.from({ length: 24 }, (_, hour) => {
        const found = map.get(hour);
        return {
            hour,
            revenue: safeNumber(found?.revenue),
            orderCount: safeNumber(found?.orderCount),
        };
    });
};



