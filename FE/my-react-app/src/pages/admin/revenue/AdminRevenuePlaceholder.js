import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import './AdminRevenuePlaceholder.scss';
import Loading from '../../../components/Loading/Loading';
import { getAllCategories } from '../../../api/customer/ProductAPI';
import {
    formatDateOnly,
    formatPrice,
    formatPercent,
    formatCompactNumber,
    getApiErrorMessage,
    getTodayInputValue,
    loadRevenueDashboardData,
    normalizeCategories,
    normalizeDailySeries,
    REVENUE_DATE_OPTIONS,
    REVENUE_PIE_COLORS,
    REVENUE_SORT_OPTIONS,
    safeNumber,
} from '../../../utils';

function SummaryCard({ title, value, subtitle, tone = 'neutral', badge, className = '' }) {
    return (
        <article className={`admin-revenue__panel admin-revenue__stat ${className}`.trim()}>
            <div className="admin-revenue__stat-title">{title}</div>
            <div className="admin-revenue__stat-value">{value}</div>
            {badge ? <div className={`admin-revenue__stat-chip admin-revenue__stat-chip--${tone}`}>{badge}</div> : null}
            <div className="admin-revenue__stat-subtitle">{subtitle}</div>
        </article>
    );
}

function TotalRevenueDetails({ total }) {
    const growth = safeNumber(total?.growthPercentage);

    return (
        <div className="admin-revenue__total-details">
            <div className="admin-revenue__total-grid">
                <div className="admin-revenue__total-group">
                    <div className="admin-revenue__total-heading">Current period</div>
                    <div className="admin-revenue__total-line">
                        <span>Revenue</span>
                        <strong>{formatPrice(total?.currentRevenue)}</strong>
                    </div>
                    <div className="admin-revenue__total-line">
                        <span>Orders</span>
                        <strong>{formatCompactNumber(total?.totalCurrentOrders)}</strong>
                    </div>
                </div>

                <div className="admin-revenue__total-group">
                    <div className="admin-revenue__total-heading">Previous period</div>
                    <div className="admin-revenue__total-line">
                        <span>Revenue</span>
                        <strong>{formatPrice(total?.previousRevenue)}</strong>
                    </div>
                    <div className="admin-revenue__total-line">
                        <span>Orders</span>
                        <strong>{formatCompactNumber(total?.totalPreviousOrders)}</strong>
                    </div>
                </div>
            </div>

            <div className={`admin-revenue__total-growth ${growth >= 0 ? 'is-up' : 'is-down'}`}>
                Growth: {formatPercent(growth)}
            </div>
        </div>
    );
}

function PendingRevenueDetails({ pending }) {
    return (
        <div className="admin-revenue__mini-details">
            <div className="admin-revenue__mini-row">
                <span>Pending orders</span>
                <strong>{formatCompactNumber(pending?.pendingOrders)}</strong>
            </div>
            <div className="admin-revenue__mini-row">
                <span>Range</span>
                <strong>{pending?.range?.label || '-'}</strong>
            </div>
            <div className="admin-revenue__mini-row">
                <span>Pipeline status</span>
                <strong>Pending/Approved/Shipping</strong>
            </div>
        </div>
    );
}

function CancelRateDetails({ cancelRate }) {
    return (
        <div className="admin-revenue__mini-details">
            <div className="admin-revenue__mini-row">
                <span>Cancelled orders</span>
                <strong>{formatCompactNumber(cancelRate?.cancelledOrders)}</strong>
            </div>
            <div className="admin-revenue__mini-row">
                <span>Total orders</span>
                <strong>{formatCompactNumber(cancelRate?.totalOrders)}</strong>
            </div>
            <div className="admin-revenue__mini-row">
                <span>Cancelled revenue</span>
                <strong>{formatPrice(cancelRate?.cancelledRevenue)}</strong>
            </div>
        </div>
    );
}

function SectionCard({ title, subtitle, meta, children, className = '' }) {
    return (
        <section className={`admin-revenue__panel admin-revenue__card ${className}`.trim()}>
            <header className="admin-revenue__card-header">
                <div>
                    <h3 className="admin-revenue__card-title">{title}</h3>
                    {subtitle ? <div className="admin-revenue__card-subtitle">{subtitle}</div> : null}
                </div>
                {meta ? <div className="admin-revenue__card-meta">{meta}</div> : null}
            </header>
            {children}
        </section>
    );
}

function RevenueLineChart({ data = [] }) {
    const normalized = normalizeDailySeries(data).map((item) => ({
        ...item,
        hourLabel: `${String(item.hour).padStart(2, '0')}h`,
        revenue: safeNumber(item.revenue),
    }));

    const tooltipFormatter = (value, name) => {
        if (name === 'revenue') return [formatPrice(value), 'Revenue'];
        return [value, name];
    };

    return (
        <div className="admin-revenue__chart-container admin-revenue__chart-container--hour">
            <ResponsiveContainer width="100%" height={360}>
                <LineChart data={normalized} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="hourLabel" tick={{ fontSize: 12, fill: '#64748b' }} interval={0} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={formatCompactNumber} />
                    <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `Time: ${label}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#426B1F" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function RevenuePieChart({ data = [], totalFormatter = formatPrice }) {
    const [activeIndex, setActiveIndex] = useState(-1);

    const normalized = useMemo(
        () =>
            data
                .map((item, index) => ({
                    label: item.categoryName || item.paymentMethod || item.name || `Item ${index + 1}`,
                    value: safeNumber(item.totalRevenue || item.revenue || item.totalQuantitySold || item.orderCount),
                    revenuePercentage: safeNumber(item.revenuePercentage),
                    color: REVENUE_PIE_COLORS[index % REVENUE_PIE_COLORS.length],
                }))
                .filter((item) => item.value > 0),
        [data]
    );

    if (!normalized.length) {
        return <div className="admin-revenue__empty">No data available for this chart.</div>;
    }

    const RADIAN = Math.PI / 180;

    const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.62;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        const percent = safeNumber(payload?.revenuePercentage);

        if (!percent || percent < 3) return null;

        return (
            <text x={x} y={y} fill="#ffffff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={700}>
                {`${percent.toFixed(1)}%`}
            </text>
        );
    };

    return (
        <div className="admin-revenue__pie-layout">
            <div className="admin-revenue__pie-chart">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={normalized}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={0}
                            labelLine={false}
                            label={renderSliceLabel}
                            activeIndex={activeIndex}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(-1)}
                        >
                            {normalized.map((entry, index) => (
                                <Cell
                                    key={`cell-${entry.label}`}
                                    fill={entry.color}
                                    stroke={entry.color}
                                    strokeWidth={0}
                                    opacity={activeIndex >= 0 && activeIndex !== index ? 0.45 : 1}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, _name, item) => {
                                const payload = item?.payload;
                                return [
                                    `${totalFormatter(value)} (${safeNumber(payload?.revenuePercentage).toFixed(1)}%)`,
                                    payload?.label || 'Value',
                                ];
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="admin-revenue__legend">
                {normalized.map((slice) => (
                    <div className="admin-revenue__legend-item" key={slice.label}>
                        <span className="admin-revenue__legend-swatch" style={{ background: slice.color }} />
                        <span className="admin-revenue__legend-name">{slice.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopProductsTable({ data = [] }) {
    if (!data.length) {
        return <div className="admin-revenue__empty">No products found for the selected filters.</div>;
    }

    return (
        <div className="admin-revenue__table-wrap">
            <table className="admin-revenue__table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Revenue</th>
                        <th>Quantity Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={`${item.productId || index}-${item.productTitle}`}>
                            <td>{index + 1}</td>
                            <td>{item.productTitle}</td>
                            <td>{item.categoryName || '-'}</td>
                            <td>{formatPrice(item.totalRevenue)}</td>
                            <td>{formatCompactNumber(item.totalQuantitySold)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RevenueTabs({ activeTab, onChange }) {
    return (
        <section className="admin-revenue__tabs">
            <button
                type="button"
                className={`admin-revenue__tab ${activeTab === 'overview' ? 'is-active' : ''}`}
                onClick={() => onChange('overview')}
            >
                Overview
            </button>
            <button
                type="button"
                className={`admin-revenue__tab ${activeTab === 'daily' ? 'is-active' : ''}`}
                onClick={() => onChange('daily')}
            >
                Daily revenue
            </button>
        </section>
    );
}

function AdminRevenuePlaceholder() {
    const initialSummaryFilters = useMemo(
        () => ({
            dateOption: 'THIS_MONTH',
            categoryId: '',
        }),
        []
    );
    const initialDailyFilters = useMemo(
        () => ({
            dailyDate: getTodayInputValue(),
            categoryId: '',
        }),
        []
    );
    const [draftSummaryFilters, setDraftSummaryFilters] = useState(initialSummaryFilters);
    const [appliedSummaryFilters, setAppliedSummaryFilters] = useState(initialSummaryFilters);
    const [draftDailyFilters, setDraftDailyFilters] = useState(initialDailyFilters);
    const [appliedDailyFilters, setAppliedDailyFilters] = useState(initialDailyFilters);
    const [draftTopSort, setDraftTopSort] = useState('REVENUE');
    const [appliedTopSort, setAppliedTopSort] = useState('REVENUE');
    const [activeTab, setActiveTab] = useState('overview');
    const [categories, setCategories] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadCategories = async () => {
            try {
                const response = await getAllCategories();
                if (!mounted) return;
                setCategories(normalizeCategories(response));
            } catch (_) {
                if (!mounted) return;
                setCategories([{ id: '', name: 'All categories' }]);
            }
        };

        loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await loadRevenueDashboardData({
                dateOption: appliedSummaryFilters.dateOption,
                categoryId: appliedSummaryFilters.categoryId ? Number(appliedSummaryFilters.categoryId) : null,
                sortBy: appliedTopSort,
                dailyDate: appliedDailyFilters.dailyDate,
                dailyCategoryId: appliedDailyFilters.categoryId ? Number(appliedDailyFilters.categoryId) : null,
            });
            setDashboard(data);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to load revenue dashboard.'));
        } finally {
            setLoading(false);
        }
    }, [appliedDailyFilters, appliedSummaryFilters, appliedTopSort]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const selectedDateLabel = useMemo(() => {
        const selected = REVENUE_DATE_OPTIONS.find((item) => item.value === appliedSummaryFilters.dateOption);
        return selected?.label || appliedSummaryFilters.dateOption;
    }, [appliedSummaryFilters.dateOption]);

    const selectedCategoryLabel = useMemo(() => {
        if (!appliedSummaryFilters.categoryId) return 'All categories';
        return categories.find((item) => String(item.id) === String(appliedSummaryFilters.categoryId))?.name || 'Selected category';
    }, [appliedSummaryFilters.categoryId, categories]);

    const selectedDailyCategoryLabel = useMemo(() => {
        if (!appliedDailyFilters.categoryId) return 'All categories';
        return categories.find((item) => String(item.id) === String(appliedDailyFilters.categoryId))?.name || 'Selected category';
    }, [appliedDailyFilters.categoryId, categories]);

    const dailyDateLabel = useMemo(() => {
        const rawDate = appliedDailyFilters.dailyDate;
        if (!rawDate) return '-';
        const parsed = new Date(`${rawDate}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? rawDate : formatDateOnly(parsed);
    }, [appliedDailyFilters.dailyDate]);

    const applySummaryFilters = useCallback(() => {
        setAppliedSummaryFilters({ ...draftSummaryFilters });
    }, [draftSummaryFilters]);

    const applyDailyFilters = useCallback(() => {
        setAppliedDailyFilters({ ...draftDailyFilters });
    }, [draftDailyFilters]);

    const applyTopSort = useCallback(() => {
        setAppliedTopSort(draftTopSort);
    }, [draftTopSort]);

    const handleSummaryFilterSubmit = useCallback(
        (event) => {
            event.preventDefault();
            applySummaryFilters();
        },
        [applySummaryFilters]
    );

    const handleDailyFilterSubmit = useCallback(
        (event) => {
            event.preventDefault();
            applyDailyFilters();
        },
        [applyDailyFilters]
    );

    const currentSummary = dashboard?.totalRevenue;
    const pendingSummary = dashboard?.pendingRevenue;
    const cancelSummary = dashboard?.cancelRate;
    const dailySeries = dashboard?.dailyRevenue || [];
    const categorySeries = dashboard?.categoryRevenue || [];
    const paymentSeries = dashboard?.paymentMethodRevenue || [];
    const topProducts = dashboard?.topProducts || [];
    const topMetricLabel = appliedTopSort === 'QUANTITY' ? 'Quantity sold' : 'Revenue';
    const topChartSubtitle = `Top products sorted by ${topMetricLabel.toLowerCase()}`;

    return (
        <section className="admin-revenue">
            <Loading isLoading={loading} fullScreen />

            <header className="admin-revenue__hero">
                <div>
                    <h1>Revenue Dashboard</h1>
                    <p>
                        Monitor total revenue, pending revenue, growth trends, category contribution, payment method share,
                        and top products in one place.
                    </p>
                </div>

                <div className="admin-revenue__hero-meta">
                    <div className="admin-revenue__hero-badge">{selectedDateLabel}</div>
                    <div className="admin-revenue__hero-update">Summary category: {selectedCategoryLabel}</div>
                    <div className="admin-revenue__hero-update">Daily chart date: {dailyDateLabel}</div>
                </div>
            </header>

            <RevenueTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'overview' ? (
                <section className="admin-revenue__panel">
                    <form className="admin-revenue__filters admin-revenue__filters--overview" onSubmit={handleSummaryFilterSubmit}>
                        <label className="admin-revenue__field">
                            <span className="admin-revenue__label">Summary date range</span>
                            <select
                                className="admin-revenue__control"
                                value={draftSummaryFilters.dateOption}
                                onChange={(e) => setDraftSummaryFilters((prev) => ({ ...prev, dateOption: e.target.value }))}
                            >
                                {REVENUE_DATE_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-revenue__field">
                            <span className="admin-revenue__label">Summary category</span>
                            <select
                                className="admin-revenue__control"
                                value={draftSummaryFilters.categoryId}
                                onChange={(e) => setDraftSummaryFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
                            >
                                {categories.map((item) => (
                                    <option key={item.id || 'all'} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>


                        <button type="submit" className="admin-revenue__button">
                            Apply filter
                        </button>
                    </form>
                </section>
            ) : (
                <section className="admin-revenue__panel admin-revenue__panel--daily">
                    <form className="admin-revenue__filters admin-revenue__filters--daily" onSubmit={handleDailyFilterSubmit}>
                        <label className="admin-revenue__field">
                            <span className="admin-revenue__label">Daily chart date</span>
                            <input
                                className="admin-revenue__control"
                                type="date"
                                value={draftDailyFilters.dailyDate}
                                onChange={(e) => setDraftDailyFilters((prev) => ({ ...prev, dailyDate: e.target.value }))}
                            />
                        </label>

                        <label className="admin-revenue__field">
                            <span className="admin-revenue__label">Daily category</span>
                            <select
                                className="admin-revenue__control"
                                value={draftDailyFilters.categoryId}
                                onChange={(e) => setDraftDailyFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
                            >
                                {categories.map((item) => (
                                    <option key={`daily-${item.id || 'all'}`} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button type="submit" className="admin-revenue__button">
                            Apply filter
                        </button>
                    </form>
                </section>
            )}

            {error ? (
                <section className="admin-revenue__error">
                    <strong>Unable to load revenue data.</strong>
                    <div>{error}</div>
                    <div className="admin-revenue__error-actions">
                        <button type="button" className="admin-revenue__button admin-revenue__button--secondary" onClick={loadDashboard}>
                            Try again
                        </button>
                    </div>
                </section>
            ) : null}

            {activeTab === 'overview' ? (
                <>
                    <section className="admin-revenue__summary">
                        <SummaryCard
                            title="Total revenue"
                            value={formatPrice(currentSummary?.currentRevenue)}
                            subtitle={<TotalRevenueDetails total={currentSummary} />}
                            tone="success"
                            badge={currentSummary?.currentRange?.label || selectedDateLabel}
                            className="admin-revenue__stat--total"
                        />

                        <SummaryCard
                            title="Pending revenue"
                            value={formatPrice(pendingSummary?.pendingRevenue)}
                            subtitle={<PendingRevenueDetails pending={pendingSummary} />}
                            tone="warning"
                            badge={pendingSummary?.range?.label || selectedDateLabel}
                        />

                        <SummaryCard
                            title="Cancel rate"
                            value={formatPercent(cancelSummary?.cancellationRate)}
                            subtitle={<CancelRateDetails cancelRate={cancelSummary} />}
                            tone="danger"
                            badge={cancelSummary?.range?.label || selectedDateLabel}
                        />
                    </section>

                    <div className="admin-revenue__grid admin-revenue__grid--two">
                        <SectionCard
                            title="Revenue by category"
                            subtitle="Share of total revenue by category"
                            meta={dashboard?.categoryRange?.label || selectedDateLabel}
                        >
                            <RevenuePieChart data={categorySeries} totalFormatter={formatPrice} />
                        </SectionCard>

                        <SectionCard
                            title="Revenue by payment method"
                            subtitle="Revenue share of VNPAY vs CASH"
                            meta={dashboard?.paymentMethodRange?.label || selectedDateLabel}
                        >
                            <RevenuePieChart data={paymentSeries} totalFormatter={formatPrice} />
                        </SectionCard>
                    </div>

                    <SectionCard
                        title="Top products"
                        subtitle={topChartSubtitle}
                        meta={dashboard?.topProductsRange?.label || selectedDateLabel}
                    >
                        <div className="admin-revenue__top-filter">
                            <label className="admin-revenue__field">
                                <span className="admin-revenue__label">Top products sort</span>
                                <select
                                    className="admin-revenue__control"
                                    value={draftTopSort}
                                    onChange={(e) => setDraftTopSort(e.target.value)}
                                >
                                    {REVENUE_SORT_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button type="button" className="admin-revenue__button" onClick={applyTopSort}>
                                Apply filter
                            </button>
                        </div>
                        <TopProductsTable data={topProducts} />
                    </SectionCard>
                </>
            ) : (
                <SectionCard
                    title="Daily revenue"
                    subtitle="Hourly revenue by selected day. This chart is separate from summary DateOption filter."
                    meta={`${dailyDateLabel} | ${selectedDailyCategoryLabel}`}
                >
                    <RevenueLineChart data={dailySeries} />
                </SectionCard>
            )}
        </section>
    );
}

export default AdminRevenuePlaceholder;


