import React, { useState } from 'react';
import { formatDate } from '../../../utils';
import { getStatusMeta } from '../../../utils/reviewUtils';
import { getCurrentUser } from '../../../api/AuthAPI';
import ProductReviewManagerAPI from '../../../api/pm/product/ProductReviewManagerAPI';
import { useToast } from '../../Toast/Toast';
import './PMReviewReplyModal.scss';

function PMReviewReplyModal({ isOpen, onClose, review, onReplySubmitted = null }) {
    const { triggerToast } = useToast();

    const [replyContent, setReplyContent] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingReplyContent, setEditingReplyContent] = useState('');
    const [editingMenuId, setEditingMenuId] = useState(null);

    const currentUser = getCurrentUser();

    if (!isOpen || !review) return null;

    const isCurrentUserOwnerOfReply = (reply) => {
        if (!currentUser?.username) return false;
        const replyUsername = reply.userName || reply.userUsername || reply.user?.username;
        return replyUsername === currentUser.username;
    };

    const isCurrentUserAdmin = () => {
        if (!currentUser) return false;
        if (typeof currentUser.role === 'string' && currentUser.role.includes('ADMIN')) return true;
        return !!(Array.isArray(currentUser.roles) && currentUser.roles.some(r => r.includes('ADMIN')));

    };

    const canEditOrDeleteReply = (reply) => {
        return isCurrentUserOwnerOfReply(reply) || isCurrentUserAdmin();
    };

    const isCustomerCurrentUser = currentUser?.username &&
        (review.userName === currentUser.username || review.customerUsername === currentUser.username);

    const isDeleted = review.isDeleted;
    const isPending = review.reviewStatusCode === 0 || review.status === 0;

    const handleApiError = (error, defaultMsg) => {
        console.error(error);
        const errorMsg = typeof error?.response?.data === 'string'
            ? error.response.data
            : (error?.response?.data?.message || error?.message || defaultMsg);
        triggerToast('error', errorMsg);
    };

    const handleAddReply = async () => {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            await ProductReviewManagerAPI.addReplyFromPM(review.id, { comment: replyContent });
            setReplyContent('');
            setShowReplyInput(false);
            triggerToast('success', 'Reply sent successfully');
            if (onReplySubmitted) onReplySubmitted(false);
        } catch (error) {
            handleApiError(error, 'Failed to add reply.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEditReply = async () => {
        if (!editingReplyContent.trim()) return;
        setSubmitting(true);
        try {
            await ProductReviewManagerAPI.updateReplyByPM(editingReplyId, { comment: editingReplyContent });
            setEditingReplyId(null);
            setEditingReplyContent('');
            triggerToast('success', 'Reply updated successfully');
            if (onReplySubmitted) onReplySubmitted(false);
        } catch (error) {
            handleApiError(error, 'Failed to update reply.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (window.confirm('Are you sure you want to delete this reply?')) {
            setSubmitting(true);
            try {
                await ProductReviewManagerAPI.deleteReplyByPM(replyId);
                setEditingMenuId(null);
                triggerToast('success', 'Reply deleted successfully');
                if (onReplySubmitted) onReplySubmitted(false);
            } catch (error) {
                handleApiError(error, 'Failed to delete reply.');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handleMarkAsResolved = async () => {
        setSubmitting(true);
        try {
            await ProductReviewManagerAPI.markReviewAsResolved(review.id);
            triggerToast('success', 'Review marked as resolved');
            if (onReplySubmitted) onReplySubmitted(false);
        } catch (error) {
            handleApiError(error, 'Failed to mark review as resolved.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleForceDelete = async () => {
        if (window.confirm('Are you sure you want to force delete this review? This action cannot be undone.')) {
            setSubmitting(true);
            try {
                await ProductReviewManagerAPI.forceDeleteCustomerReview(review.id);
                triggerToast('success', 'Review force deleted successfully');
                if (onReplySubmitted) onReplySubmitted(true);
            } catch (error) {
                handleApiError(error, 'Failed to force delete review.');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const statusMeta = getStatusMeta(review.reviewStatusCode, review.reviewStatus);

    return (
        <div className="pm-rrm-overlay" onClick={() => !submitting && onClose()}>
            <div className="pm-rrm-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="pm-rrm-header">
                    <h2>Review Details</h2>
                    <button type="button" className="pm-rrm-close" onClick={onClose} disabled={submitting}>×</button>
                </div>

                {/* Meta Box */}
                <div className="pm-rrm-meta">
                    <div className="pm-rrm-meta-item">
                        <span className="pm-rrm-meta-label">Product:</span>
                        <span className="pm-rrm-meta-value">{review.productName}</span>
                    </div>
                    <div className="pm-rrm-meta-item">
                        <span className="pm-rrm-meta-label">Status:</span>
                        {/* statusMeta.badgeClass do utils trả về, class này sẽ được bọc lại an toàn trong SCSS */}
                        <span className={`pm-rrm-badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                    </div>
                    <div className="pm-rrm-meta-item">
                        <span className="pm-rrm-meta-label">Visibility:</span>
                        {isDeleted ? (
                            <span className="pm-rrm-badge pm-rrm-badge--deleted">Deleted</span>
                        ) : (
                            <span className="pm-rrm-badge pm-rrm-badge--on">Active</span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="pm-rrm-content">
                    <div className="pm-rrm-review-card">

                        {/* 1. ORIGINAL COMMENT KHÁCH HÀNG */}
                        <div className="pm-rrm-review-header">
                            <div className="pm-rrm-user-info">
                                <strong>{review.userName || review.customerName || 'Customer'}</strong>
                                {isCustomerCurrentUser && <span className="pm-rrm-you-badge">You</span>}
                                <span className="pm-rrm-rating-badge">
                                    {review.rating} ★
                                </span>
                            </div>
                            <div className="pm-rrm-review-actions">
                                <span className="pm-rrm-time">
                                    {formatDate(review.createdAt)}
                                    {review.updatedAt && review.updatedAt !== review.createdAt && ' (edited)'}
                                </span>
                            </div>
                        </div>

                        <div className="pm-rrm-review-text">
                            {review.comment}
                        </div>

                        {/* FB style Reply button */}
                        {!editingReplyId && (
                            <button
                                type="button"
                                className="pm-rrm-toggle-reply-btn"
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                disabled={submitting}
                            >
                                Reply
                            </button>
                        )}

                        {/* Ô NHẬP REPLY */}
                        {showReplyInput && !editingReplyId && (
                            <div className="pm-rrm-reply-editor">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write your reply as Admin/PM..."
                                    rows="2"
                                    disabled={submitting}
                                />
                                <div className="pm-rrm-reply-editor-actions">
                                    <button className="pm-rrm-btn-cancel" onClick={() => { setShowReplyInput(false); setReplyContent(''); }} disabled={submitting}>Cancel</button>
                                    <button className="pm-rrm-btn-submit" onClick={handleAddReply} disabled={!replyContent.trim() || submitting}>Send</button>
                                </div>
                            </div>
                        )}

                        {/* 2. DANH SÁCH REPLIES (PM / ADMIN) */}
                        {review.replies && review.replies.length > 0 && (
                            <div className="pm-rrm-replies-list">
                                {review.replies.map((reply) => {
                                    const isReplyMine = isCurrentUserOwnerOfReply(reply);

                                    return (
                                        <div key={reply.id} className="pm-rrm-reply-card">
                                            {editingReplyId === reply.id ? (
                                                // CHẾ ĐỘ SỬA
                                                <div className="pm-rrm-reply-editor">
                                                    <textarea
                                                        value={editingReplyContent}
                                                        onChange={(e) => setEditingReplyContent(e.target.value)}
                                                        rows="2"
                                                        disabled={submitting}
                                                    />
                                                    <div className="pm-rrm-reply-editor-actions">
                                                        <button className="pm-rrm-btn-cancel" onClick={() => { setEditingReplyId(null); setEditingReplyContent(''); }} disabled={submitting}>Cancel</button>
                                                        <button className="pm-rrm-btn-submit" onClick={handleSaveEditReply} disabled={!editingReplyContent.trim() || submitting}>Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // CHẾ ĐỘ XEM
                                                <>
                                                    <div className="pm-rrm-reply-header">
                                                        <div className="pm-rrm-reply-user-info">
                                                            <strong className="pm-rrm-reply-username">{reply.userName || reply.user?.name || 'Manager'}</strong>
                                                            <span className="pm-rrm-role-badge">
                                                                {reply.userRole === 'ROLE_ADMIN' || reply.user?.role === 'ROLE_ADMIN' ? 'ADMIN' : 'PM'}
                                                            </span>
                                                            {isReplyMine && <span className="pm-rrm-you-badge">You</span>}
                                                        </div>
                                                        <div className="pm-rrm-review-actions">
                                                            <span className="pm-rrm-reply-time">
                                                                {formatDate(reply.createdAt)}
                                                                {reply.updatedAt && reply.updatedAt !== reply.createdAt && ' (edited)'}
                                                            </span>

                                                            {canEditOrDeleteReply(reply) && (
                                                                <div className="pm-rrm-menu-wrapper">
                                                                    <button
                                                                        type="button"
                                                                        className="pm-rrm-menu-btn"
                                                                        onClick={() => setEditingMenuId(editingMenuId === reply.id ? null : reply.id)}
                                                                        disabled={submitting}
                                                                    >
                                                                        ⋯
                                                                    </button>
                                                                    {editingMenuId === reply.id && (
                                                                        <div className="pm-rrm-menu-dropdown">
                                                                            <button onClick={() => { setEditingReplyId(reply.id); setEditingReplyContent(reply.comment); setEditingMenuId(null); }}>Edit</button>
                                                                            <button className="pm-rrm-menu-delete" onClick={() => handleDeleteReply(reply.id)}>Delete</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="pm-rrm-reply-text">
                                                        {reply.comment}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Bottom */}
                <div className="pm-rrm-footer-actions">
                    <button type="button" className="pm-rrm-footer-btn pm-rrm-footer-btn--cancel" onClick={onClose} disabled={submitting}>
                        Close
                    </button>

                    {isPending && !isDeleted && (
                        <button type="button" className="pm-rrm-footer-btn pm-rrm-footer-btn--success" onClick={handleMarkAsResolved} disabled={submitting}>
                            {submitting ? 'Marking...' : 'Mark as Resolved'}
                        </button>
                    )}

                    {!isDeleted && (
                        <button type="button" className="pm-rrm-footer-btn pm-rrm-footer-btn--danger" onClick={handleForceDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Force Delete'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PMReviewReplyModal;