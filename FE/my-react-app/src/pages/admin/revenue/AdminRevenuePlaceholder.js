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

function SummaryCard({ title, value, subtitle, tone = 'neutral', badge }) {
    return (
        <article className="admin-revenue__panel admin-revenue__stat">
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

function AdminRevenuePlaceholder() {
    const initialFilters = useMemo(
        () => ({
            dateOption: 'THIS_MONTH',
            dailyDate: getTodayInputValue(),
            categoryId: '',
            sortBy: 'REVENUE',
        }),
        []
    );
    const [draftFilters, setDraftFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
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
                dateOption: appliedFilters.dateOption,
                categoryId: appliedFilters.categoryId ? Number(appliedFilters.categoryId) : null,
                sortBy: appliedFilters.sortBy,
                dailyDate: appliedFilters.dailyDate,
            });
            setDashboard(data);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to load revenue dashboard.'));
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const selectedDateLabel = useMemo(() => {
        const selected = REVENUE_DATE_OPTIONS.find((item) => item.value === appliedFilters.dateOption);
        return selected?.label || appliedFilters.dateOption;
    }, [appliedFilters.dateOption]);

    const selectedCategoryLabel = useMemo(() => {
        if (!appliedFilters.categoryId) return 'All categories';
        return categories.find((item) => String(item.id) === String(appliedFilters.categoryId))?.name || 'Selected category';
    }, [appliedFilters.categoryId, categories]);

    const applyFilters = useCallback(() => {
        setAppliedFilters({ ...draftFilters });
    }, [draftFilters]);

    const handleFilterSubmit = useCallback(
        (event) => {
            event.preventDefault();
            applyFilters();
        },
        [applyFilters]
    );

    const currentSummary = dashboard?.totalRevenue;
    const pendingSummary = dashboard?.pendingRevenue;
    const cancelSummary = dashboard?.cancelRate;
    const dailySeries = dashboard?.dailyRevenue || [];
    const categorySeries = dashboard?.categoryRevenue || [];
    const paymentSeries = dashboard?.paymentMethodRevenue || [];
    const topProducts = dashboard?.topProducts || [];
    const topMetricLabel = appliedFilters.sortBy === 'QUANTITY' ? 'Quantity sold' : 'Revenue';
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
                    <div className="admin-revenue__hero-update">Category: {selectedCategoryLabel}</div>
                    <div className="admin-revenue__hero-update">Hourly chart: {formatDateOnly(new Date(`${appliedFilters.dailyDate}T00:00:00`))}</div>
                </div>
            </header>

            <section className="admin-revenue__panel">
                <form className="admin-revenue__filters" onSubmit={handleFilterSubmit}>
                    <label className="admin-revenue__field">
                        <span className="admin-revenue__label">Date range</span>
                        <select
                            className="admin-revenue__control"
                            value={draftFilters.dateOption}
                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, dateOption: e.target.value }))}
                        >
                            {REVENUE_DATE_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="admin-revenue__field">
                        <span className="admin-revenue__label">Category</span>
                        <select
                            className="admin-revenue__control"
                            value={draftFilters.categoryId}
                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
                        >
                            {categories.map((item) => (
                                <option key={item.id || 'all'} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="admin-revenue__field">
                        <span className="admin-revenue__label">Top products sort</span>
                        <select
                            className="admin-revenue__control"
                            value={draftFilters.sortBy}
                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                        >
                            {REVENUE_SORT_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="admin-revenue__field">
                        <span className="admin-revenue__label">Hourly chart date</span>
                        <input
                            className="admin-revenue__control"
                            type="date"
                            value={draftFilters.dailyDate}
                            onChange={(e) => setDraftFilters((prev) => ({ ...prev, dailyDate: e.target.value }))}
                        />
                    </label>

                    <button type="submit" className="admin-revenue__button">
                        Filter
                    </button>
                </form>
            </section>

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

            <section className="admin-revenue__summary">
                <SummaryCard
                    title="Total revenue"
                    value={formatPrice(currentSummary?.currentRevenue)}
                    subtitle={<TotalRevenueDetails total={currentSummary} />}
                    tone="success"
                    badge={currentSummary?.currentRange?.label || selectedDateLabel}
                />

                <SummaryCard
                    title="Pending revenue"
                    value={formatPrice(pendingSummary?.pendingRevenue)}
                    subtitle={<PendingRevenueDetails pending={pendingSummary} />}
                    tone="warning"
                    badge="Pending"
                />

                <SummaryCard
                    title="Cancel rate"
                    value={formatPercent(cancelSummary?.cancellationRate)}
                    subtitle={<CancelRateDetails cancelRate={cancelSummary} />}
                    tone="danger"
                    badge="Cancelled"
                />
            </section>

            <SectionCard
                title="Revenue by hour"
                subtitle="Line chart of hourly revenue for the selected date"
                meta={formatDateOnly(new Date(`${appliedFilters.dailyDate}T00:00:00`))}
            >
                <RevenueLineChart data={dailySeries} />
            </SectionCard>

            <div className="admin-revenue__grid admin-revenue__grid--two">
                <SectionCard
                    title="Revenue by category"
                    subtitle="Share of total revenue by category"
                    meta={selectedDateLabel}
                >
                    <RevenuePieChart data={categorySeries} totalFormatter={formatPrice} />
                </SectionCard>

                <SectionCard
                    title="Revenue by payment method"
                    subtitle="Revenue share of VNPAY vs CASH"
                    meta={selectedCategoryLabel}
                >
                    <RevenuePieChart data={paymentSeries} totalFormatter={formatPrice} />
                </SectionCard>
            </div>

            <SectionCard
                title="Top products"
                subtitle={topChartSubtitle}
                meta={selectedCategoryLabel}
            >
                <TopProductsTable data={topProducts} />
            </SectionCard>
        </section>
    );
}

export default AdminRevenuePlaceholder;


