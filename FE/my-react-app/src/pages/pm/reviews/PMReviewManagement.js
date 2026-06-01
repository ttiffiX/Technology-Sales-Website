import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getReviewsForManager } from '../../../api/pm/product/ProductReviewManagerAPI';
import PaginationControls from '../../../components/pagination/PaginationControls';
import { StarDisplay } from '../../../utils/reviewUtils';
import {capitalize, formatDate, normalizePageResponse} from '../../../utils';
import './PMReviewManagement.scss';

const PAGE_SIZE = 10;
const DEFAULT_SORT = 'createdAt,desc';

const getInitialValue = (searchParams, key, fallback = '') => searchParams.get(key) || fallback;

const getInitialPage = (searchParams) => {
    const parsed = Number.parseInt(searchParams.get('page') || '0', 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

// Hàm map Status (0: Pending, 1: Replied, 2: Resolved)
const getStatusMeta = (statusCode, status) => {
    switch (statusCode) {
        case 0:
            return { label: capitalize(status), badgeClass: 'pm-active-badge--pending', rowClass: 'pm-product-table__row--pending' };
        case 1:
            return { label: capitalize(status), badgeClass: 'pm-active-badge--replied', rowClass: 'pm-product-table__row--processed' };
        case 2:
            return { label: capitalize(status), badgeClass: 'pm-active-badge--on', rowClass: 'pm-product-table__row--processed' };
        default:
            return { label: capitalize(status), badgeClass: '', rowClass: '' };
    }
};

function PMReviewManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetchedInitialDataRef = useRef(false);
    const initialSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviewsError, setReviewsError] = useState(null);

    // --- STATE ĐANG NHẬP TRÊN GIAO DIỆN ---
    const [keywordInput, setKeywordInput] = useState(getInitialValue(initialSearchParams, 'keyword'));
    const [starFilterInput, setStarFilterInput] = useState(getInitialValue(initialSearchParams, 'star'));
    const [statusFilterInput, setStatusFilterInput] = useState(getInitialValue(initialSearchParams, 'status'));
    const [deletedFilterInput, setDeletedFilterInput] = useState(getInitialValue(initialSearchParams, 'isDeleted'));

    // --- STATE ĐÃ ÁP DỤNG (Chỉ cập nhật khi bấm Search) ---
    const [appliedKeyword, setAppliedKeyword] = useState(getInitialValue(initialSearchParams, 'keyword'));
    const [appliedStarFilter, setAppliedStarFilter] = useState(getInitialValue(initialSearchParams, 'star'));
    const [appliedStatusFilter, setAppliedStatusFilter] = useState(getInitialValue(initialSearchParams, 'status'));
    const [appliedDeletedFilter, setAppliedDeletedFilter] = useState(getInitialValue(initialSearchParams, 'isDeleted'));

    const [sortBy] = useState(getInitialValue(initialSearchParams, 'sort', DEFAULT_SORT));
    const [pageNumber, setPageNumber] = useState(() => getInitialPage(initialSearchParams));
    const [pageSize] = useState(PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const hasSyncedInitialStateRef = useRef(false);

    const loadReviews = async (nextPage = pageNumber) => {
        setLoadingReviews(true);
        setReviewsError(null);

        try {
            const params = {
                page: nextPage,
                size: pageSize,
                sort: sortBy,
            };

            if (appliedKeyword.trim()) params.keyword = appliedKeyword.trim();
            if (appliedStarFilter) params.star = Number(appliedStarFilter);

            // Map status về số Integer (0, 1, 2)
            if (appliedStatusFilter !== '') params.status = Number(appliedStatusFilter);

            // Map isDeleted về Boolean (true, false)
            if (appliedDeletedFilter !== '') params.isDeleted = appliedDeletedFilter === 'true';

            const rawData = await getReviewsForManager(params);
            const pageData = normalizePageResponse(rawData);
            const rows = Array.isArray(pageData.content) ? pageData.content : [];

            setReviews(rows);
            setPageNumber(Number.isFinite(pageData.pageNumber) ? pageData.pageNumber : nextPage);
            setTotalPages(Number.isFinite(pageData.totalPages) ? pageData.totalPages : 0);
            setTotalElements(Number.isFinite(pageData.totalElements) ? pageData.totalElements : rows.length);
        } catch (error) {
            console.error('Failed to load review list', error);
            setReviews([]);
            setTotalPages(0);
            setTotalElements(0);
            setReviewsError('Failed to load review list');
        } finally {
            setLoadingReviews(false);
        }
    };

    const syncListUrl = (nextState = {}) => {
        const params = new URLSearchParams();
        const nextKeyword = String(nextState.keyword ?? appliedKeyword).trim();
        const nextStar = String(nextState.star ?? appliedStarFilter).trim();
        const nextStatus = String(nextState.status ?? appliedStatusFilter).trim();
        const nextDeleted = String(nextState.isDeleted ?? appliedDeletedFilter).trim();
        const nextSort = String(nextState.sort ?? sortBy).trim();
        const nextPage = Number.isFinite(nextState.page) ? nextState.page : pageNumber;

        if (nextKeyword) params.set('keyword', nextKeyword);
        if (nextStar) params.set('star', nextStar);
        if (nextStatus !== '') params.set('status', nextStatus);
        if (nextDeleted !== '') params.set('isDeleted', nextDeleted);
        if (nextSort) params.set('sort', nextSort);
        if (Number.isFinite(nextPage) && nextPage > 0) params.set('page', String(nextPage));

        navigate(
            {
                pathname: '/pm/products/reviews',
                search: params.toString() ? `?${params.toString()}` : '',
            },
            { replace: true }
        );
    };

    useEffect(() => {
        if (hasFetchedInitialDataRef.current) return;
        hasFetchedInitialDataRef.current = true;
        loadReviews(pageNumber);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hasFetchedInitialDataRef.current) return;
        if (!hasSyncedInitialStateRef.current) {
            hasSyncedInitialStateRef.current = true;
            syncListUrl();
            return;
        }

        syncListUrl();
        loadReviews(pageNumber);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedKeyword, appliedStarFilter, appliedStatusFilter, appliedDeletedFilter, sortBy, pageNumber]);

    const handleSearch = () => {
        setAppliedKeyword(keywordInput.trim());
        setAppliedStarFilter(starFilterInput);
        setAppliedStatusFilter(statusFilterInput);
        setAppliedDeletedFilter(deletedFilterInput);
        setPageNumber(0);
    };

    const handleReset = () => {
        setKeywordInput('');
        setStarFilterInput('');
        setStatusFilterInput('');
        setDeletedFilterInput('');

        setAppliedKeyword('');
        setAppliedStarFilter('');
        setAppliedStatusFilter('');
        setAppliedDeletedFilter('');

        setPageNumber(0);
        navigate('/pm/products/reviews', { replace: true });
    };

    const handleViewDetails = (reviewId) => {
        console.log('View review details:', reviewId);
    };

    return (
        <div className="pm-page">
            <div className="pm-page-header">
                <h2>Review Management</h2>
                <p>Manage customer product reviews</p>
            </div>

            <div className="pm-content">
                <div className="pm-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm/products')}>
                        ← Product Workspace
                    </button>
                </div>

                <div className="pm-filter-container">
                    <div className="pm-filter-row pm-filter-row--first">
                        <input
                            type="text"
                            className="pm-filter-input pm-filter-input--full"
                            placeholder="Search product or customer..."
                            value={keywordInput}
                            onChange={(event) => setKeywordInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleSearch();
                            }}
                        />

                        <select
                            className="pm-filter-select"
                            value={starFilterInput}
                            onChange={(event) => setStarFilterInput(event.target.value)}
                        >
                            <option value="">All Stars</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>

                        <select
                            className="pm-filter-select"
                            value={statusFilterInput}
                            onChange={(event) => setStatusFilterInput(event.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="0">Pending</option>
                            <option value="1">Replied</option>
                            <option value="2">Resolved</option>
                        </select>

                        <select
                            className="pm-filter-select"
                            value={deletedFilterInput}
                            onChange={(event) => setDeletedFilterInput(event.target.value)}
                        >
                            <option value="">All Visibility</option>
                            <option value="false">Active</option>
                            <option value="true">Deleted</option>
                        </select>

                        <button type="button" className="pm-filter-btn" onClick={handleSearch}>
                            Search
                        </button>
                        <button type="button" className="pm-filter-btn pm-filter-btn--ghost" onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </div>

                {loadingReviews && (
                    <div className="pm-product-list-placeholder">
                        <p>Loading reviews...</p>
                    </div>
                )}

                {!loadingReviews && reviewsError && (
                    <div className="pm-product-list-placeholder pm-product-list-placeholder--error">
                        <p>{reviewsError}</p>
                        <button type="button" className="pm-btn-reload" onClick={() => loadReviews(pageNumber)}>
                            Reload
                        </button>
                    </div>
                )}

                {!loadingReviews && !reviewsError && reviews.length === 0 && (
                    <div className="pm-product-list-placeholder">
                        <p>No reviews found.</p>
                    </div>
                )}

                {!loadingReviews && !reviewsError && reviews.length > 0 && (
                    <div className="pm-product-table-wrapper">
                        <table className="pm-product-table">
                            <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Customer</th>
                                <th>Rating</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Visibility</th>
                                <th className="pm-product-table__actions">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reviews.map((review) => {
                                // 1. Lấy thông tin màu sắc/label của Status (Pending/Replied/Resolved)
                                const statusMeta = getStatusMeta(review.reviewStatusCode, review.reviewStatus);

                                // 2. Xét màu sắc nền cho thẻ TR: Nếu bị xóa thì màu đỏ, nếu không thì xét theo Status
                                const rowClassName = `pm-product-table__row ${review.isDeleted ? 'pm-product-table__row--deleted' : statusMeta.rowClass}`;

                                return (
                                    <tr key={review.id} className={rowClassName}>
                                        <td>{review.productName || '-'}</td>
                                        <td>{review.userName || review.customerName || '-'}</td>
                                        <td>
                                            <StarDisplay rating={review.rating} className="pm-review-star-display" />
                                        </td>
                                        <td>{review.createdAt ? formatDate(review.createdAt) : '-'}</td>

                                        {/* CỘT STATUS */}
                                        <td>
                                                <span className={`pm-active-badge ${statusMeta.badgeClass}`}>
                                                    {statusMeta.label}
                                                </span>
                                        </td>

                                        {/* CỘT VISIBILITY (TRẠNG THÁI DELETE) */}
                                        <td>
                                            {review.isDeleted ? (
                                                <span className="pm-active-badge pm-active-badge--deleted">
                                                        Deleted
                                                    </span>
                                            ) : (
                                                <span className="pm-active-badge pm-active-badge--on">
                                                        Active
                                                    </span>
                                            )}
                                        </td>

                                        <td className="pm-product-table__actions">
                                            <button
                                                type="button"
                                                className="pm-action-btn pm-action-btn--view"
                                                onClick={() => handleViewDetails(review.id)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loadingReviews && !reviewsError && (
                    <PaginationControls
                        page={pageNumber}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={setPageNumber}
                        disabled={loadingReviews}
                    />
                )}
            </div>
        </div>
    );
}

export default PMReviewManagement;