import apiClient from '../../apiClient';

// Manager (PM) endpoints are under /pm/product-reviews
export const getReviewsForManager = (params = {}) => {
    // params example: { keyword, star, status, page, size }
    return apiClient.get('/pm/product-reviews', { params }).then(res => res.data);
};

export const addReplyFromPM = (reviewId, payload) => {
    // payload: { comment }
    return apiClient.post(`/pm/product-reviews/${reviewId}`, payload).then(res => res.data);
};

export const updateReplyByPM = (replyId, payload) => {
    // payload: { comment }
    return apiClient.put(`/pm/product-reviews/reply/${replyId}`, payload).then(res => res.data);
};

export const deleteReplyByPM = (replyId) => {
    return apiClient.delete(`/pm/product-reviews/reply/${replyId}`).then(res => res.data);
};

export const markReviewAsResolved = (reviewId) => {
    return apiClient.put(`/pm/product-reviews/${reviewId}`).then(res => res.data);
};

export const forceDeleteCustomerReview = (reviewId) => {
    return apiClient.delete(`/pm/product-reviews/${reviewId}/force`).then(res => res.data);
};

export default {
    getReviewsForManager,
    addReplyFromPM,
    updateReplyByPM,
    deleteReplyByPM,
    markReviewAsResolved,
    forceDeleteCustomerReview,
};

