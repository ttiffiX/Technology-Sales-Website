import apiClient from '../apiClient';

// Customer-facing product review API
// Backend controllers expose endpoints under /product-reviews
export const getProductReviewStars = (productId) => {
    return apiClient.get(`/product-reviews/${productId}/stars`).then(res => res.data);
};

// rating: optional filter (1..5). Returns a Page response from backend.
export const getProductReviews = (productId, page = 0, size = 10, rating = undefined) => {
    const params = { page, size };
    if (rating !== undefined && rating !== null) params.rating = rating;
    return apiClient.get(`/product-reviews/${productId}`, { params }).then(res => res.data);
};

export const submitProductReview = (productId, payload) => {
    // payload example: { rating: 5, comment: 'Good product' }
    // Backend expects ProductReviewCreateRequest in body which includes productId
    const body = { productId, ...payload };
    return apiClient.post(`/product-reviews`, body).then(res => res.data);
};

export const updateProductReview = (reviewId, payload) => {
    // Backend PUT /product-reviews expects ProductReviewUpdateRequest with reviewId
    const body = { reviewId, ...payload };
    return apiClient.put(`/product-reviews`, body).then(res => res.data);
};

export const deleteProductReview = (reviewId) => {
    return apiClient.delete(`/product-reviews/${reviewId}`).then(res => res.data);
};

export default {
    getProductReviewStars,
    getProductReviews,
    submitProductReview,
    updateProductReview,
    deleteProductReview,
};

