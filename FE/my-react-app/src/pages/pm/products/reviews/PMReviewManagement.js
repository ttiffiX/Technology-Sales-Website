import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getReviewsForManager} from '../../../../api/pm/product/ProductReviewManagerAPI';
import PaginationControls from '../../../../components/pagination/PaginationControls';
import {getStatusMeta, StarDisplay} from '../../../../utils/reviewUtils';
import {formatDate, getInitialPage, getInitialValue, normalizePageResponse} from '../../../../utils';
import PMReviewReplyModal from '../../../../components/modal/review/PMReviewReplyModal';
import './PMReviewManagement.scss';

const PAGE_SIZE = 10;
const DEFAULT_SORT = 'createdAt,desc';

function PMReviewManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetchedInitialDataRef = useRef(false);
    const initialSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviewsError, setReviewsError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const [keywordInput, setKeywordInput] = useState(getInitialValue(initialSearchParams, 'keyword'));
    const [starFilterInput, setStarFilterInput] = useState(getInitialValue(initialSearchParams, 'star'));
    const [statusFilterInput, setStatusFilterInput] = useState(getInitialValue(initialSearchParams, 'status'));
    const [deletedFilterInput, setDeletedFilterInput] = useState(getInitialValue(initialSearchParams, 'isDeleted'));

    const [appliedKeyword, setAppliedKeyword] = useState(getInitialValue(initialSearchParams, 'keyword'));
    const [appliedStarFilter, setAppliedStarFilter] = useState(getInitialValue(initialSearchParams, 'star'));
    const [appliedStatusFilter, setAppliedStatusFilter] = useState(getInitialValue(initialSearchParams, 'status'));
    const [appliedDeletedFilter, setAppliedDeletedFilter] = useState(getInitialValue(initialSearchParams, 'isDeleted'));

    // Đón param ID từ thông báo Redirect
    const [appliedId, setAppliedId] = useState(getInitialValue(initialSearchParams, 'id'));

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
            if (appliedStatusFilter !== '') params.status = Number(appliedStatusFilter);
            if (appliedDeletedFilter !== '') params.isDeleted = appliedDeletedFilter === 'true';

            // Gửi id xuống cho Backend
            if (appliedId) params.id = appliedId;

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
        const nextId = String(nextState.id ?? appliedId).trim();
        const nextSort = String(nextState.sort ?? sortBy).trim();
        const nextPage = Number.isFinite(nextState.page) ? nextState.page : pageNumber;

        if (nextKeyword) params.set('keyword', nextKeyword);
        if (nextStar) params.set('star', nextStar);
        if (nextStatus !== '') params.set('status', nextStatus);
        if (nextDeleted !== '') params.set('isDeleted', nextDeleted);
        if (nextId) params.set('id', nextId);
        if (nextSort) params.set('sort', nextSort);
        if (Number.isFinite(nextPage) && nextPage > 0) params.set('page', String(nextPage));

        navigate(
            {
                pathname: '/pm/products/reviews',
                search: params.toString() ? `?${params.toString()}` : '',
            },
            {replace: true}
        );
    };

    useEffect(() => {
        const currentUrlParams = new URLSearchParams(location.search);
        const idFromUrl = currentUrlParams.get('id') || '';

        // Nếu ID trên thanh URL khác với ID đang lưu trong state -> Ép state cập nhật để trigger loadReviews
        if (idFromUrl !== appliedId) {
            setKeywordInput('');
            setStarFilterInput('');
            setStatusFilterInput('');
            setDeletedFilterInput('');

            setAppliedKeyword('');
            setAppliedStarFilter('');
            setAppliedStatusFilter('');
            setAppliedDeletedFilter('');
            setAppliedId(idFromUrl);
            setPageNumber(0); // Reset về trang 1
        }
    }, [location.search]);

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
    }, [appliedKeyword, appliedStarFilter, appliedStatusFilter, appliedDeletedFilter, appliedId, sortBy, pageNumber]);

    useEffect(() => {
        if (isModalOpen && selectedReview) {
            const updatedReview = reviews.find(r => r.id === selectedReview.id);
            if (updatedReview) {
                setSelectedReview(updatedReview);
            }
        }
    }, [reviews]);

    const handleSearch = () => {
        setAppliedKeyword(keywordInput.trim());
        setAppliedStarFilter(starFilterInput);
        setAppliedStatusFilter(statusFilterInput);
        setAppliedDeletedFilter(deletedFilterInput);
        // Khi người dùng tự search tay, xoá filter ID để tìm kiếm rộng
        setAppliedId('');
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
        setAppliedId('');

        setPageNumber(0);
        navigate('/pm/products/reviews', {replace: true});
    };

    const handleViewDetails = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const handleModalSuccess = (forceClose = false) => {
        if (forceClose) {
            setIsModalOpen(false);
            setSelectedReview(null);
        }
        loadReviews(pageNumber);
    };

    return (
        <div className="pm-rev-page">
            <div className="pm-rev-header">
                <h2>Review Management</h2>
                <p>Manage customer product reviews</p>
                {/* Thông báo phụ nếu đang lọc đích danh theo ID */}
                {appliedId &&
                    <p style={{color: '#d97706', fontSize: '14px', marginTop: '4px'}}>Showing direct result for Review
                        ID: #{appliedId}</p>}
            </div>

            <div className="pm-rev-content">
                <div className="pm-rev-toolbar">
                    <button className="pm-rev-btn-back" onClick={() => navigate('/pm/products')}>
                        ← Product Workspace
                    </button>
                </div>

                <div className="pm-rev-filter-container">
                    <div className="pm-rev-filter-row pm-rev-filter-row--first">
                        <input
                            type="text"
                            className="pm-rev-filter-input pm-rev-filter-input--full"
                            placeholder="Search product or customer..."
                            value={keywordInput}
                            onChange={(event) => setKeywordInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleSearch();
                            }}
                        />

                        <select
                            className="pm-rev-filter-select"
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
                            className="pm-rev-filter-select"
                            value={statusFilterInput}
                            onChange={(event) => setStatusFilterInput(event.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="0">Pending</option>
                            <option value="1">Replied</option>
                            <option value="2">Resolved</option>
                        </select>

                        <select
                            className="pm-rev-filter-select"
                            value={deletedFilterInput}
                            onChange={(event) => setDeletedFilterInput(event.target.value)}
                        >
                            <option value="">All Visibility</option>
                            <option value="false">Active</option>
                            <option value="true">Deleted</option>
                        </select>

                        <button type="button" className="pm-rev-filter-btn" onClick={handleSearch}>
                            Search
                        </button>
                        <button type="button" className="pm-rev-filter-btn pm-rev-filter-btn--ghost"
                                onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </div>

                {loadingReviews && (
                    <div className="pm-rev-placeholder">
                        <p>Loading reviews...</p>
                    </div>
                )}

                {!loadingReviews && reviewsError && (
                    <div className="pm-rev-placeholder pm-rev-placeholder--error">
                        <p>{reviewsError}</p>
                        <button type="button" className="pm-rev-btn-reload" onClick={() => loadReviews(pageNumber)}>
                            Reload
                        </button>
                    </div>
                )}

                {!loadingReviews && !reviewsError && reviews.length === 0 && (
                    <div className="pm-rev-placeholder">
                        <p>No reviews found.</p>
                    </div>
                )}

                {!loadingReviews && !reviewsError && reviews.length > 0 && (
                    <div className="pm-rev-table-wrapper">
                        <table className="pm-rev-table">
                            <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Customer</th>
                                <th>Rating</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Visibility</th>
                                <th className="pm-rev-table__actions">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reviews.map((review) => {
                                const statusMeta = getStatusMeta(review.reviewStatusCode, review.reviewStatus);
                                const rowClassName = `pm-rev-table__row ${review.isDeleted ? 'pm-rev-table__row--deleted' : statusMeta.rowClass}`;

                                return (
                                    <tr key={review.id} className={rowClassName}>
                                        <td>{review.productName || '-'}</td>
                                        <td>{review.userName || review.customerName || '-'}</td>
                                        <td>
                                            <StarDisplay rating={review.rating} className="pm-rev-star-display"/>
                                        </td>
                                        <td>{review.createdAt ? formatDate(review.createdAt) : '-'}</td>
                                        <td>
                                            <span className={`pm-rev-badge ${statusMeta.badgeClass}`}>
                                                {statusMeta.label}
                                            </span>
                                        </td>
                                        <td>
                                            {review.isDeleted ? (
                                                <span className="pm-rev-badge pm-rev-badge--deleted">Deleted</span>
                                            ) : (
                                                <span className="pm-rev-badge pm-rev-badge--on">Active</span>
                                            )}
                                        </td>
                                        <td className="pm-rev-table__actions">
                                            <button
                                                type="button"
                                                className="pm-rev-action-btn pm-rev-action-btn--view"
                                                onClick={() => handleViewDetails(review)}
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

            <PMReviewReplyModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedReview(null);
                }}
                review={selectedReview}
                onReplySubmitted={handleModalSuccess}
            />
        </div>
    );
}

export default PMReviewManagement;