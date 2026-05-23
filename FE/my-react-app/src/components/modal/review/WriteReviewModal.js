import React, {useEffect, useState} from 'react';
import './WriteReviewModal.scss';

function Star({index, onClick, selected}){
    return (
        <button type="button" className={`review-star ${selected ? 'selected' : ''}`} onClick={() => onClick(index)} aria-label={`Rate ${index} star`}>
            {selected ? '★' : '☆'}
        </button>
    );
}

function WriteReviewModal({isOpen, onClose, onSubmit, productTitle, submitting = false, initialData = null}){
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // reset when closing
            setRating(5);
            setComment('');
            return;
        }

        // when opening, populate initial data if provided (for edit)
        if (initialData) {
            if (typeof initialData.rating === 'number') setRating(initialData.rating);
            if (typeof initialData.comment === 'string') setComment(initialData.comment);
        } else {
            setRating(5);
            setComment('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (typeof onSubmit === 'function') {
            await onSubmit({ rating, comment });
        }
    };

    return (
        <div className="pm-add-modal-overlay" onClick={() => !submitting && onClose()}>
            <div className="pm-add-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pm-add-modal__header">
                     <div>
                         <h2>Write a Review</h2>
                         <p>{productTitle}</p>
                     </div>
                     <button type="button" className="pm-add-modal__close" onClick={onClose} disabled={submitting}>×</button>
                 </div>

                 <form className="pm-add-form" onSubmit={handleSubmit}>
                     <div className="pm-add-form__section">
                         <label>Rating</label>
                         <div className="review-stars-input">
                             {[1,2,3,4,5].map(n => (
                                 <Star key={n} index={n} value={n} onClick={setRating} selected={n <= rating} />
                             ))}
                             <div className="review-rating-label">{rating} - {['','Very Poor','Poor','Average','Good','Very Good'][rating]}</div>
                         </div>
                     </div>

                     <div className="pm-add-form__section">
                         <label>Comment</label>
                         <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Write your review..." />
                     </div>

                     <div className="pm-add-modal__actions">
                         <button type="button" className="pm-btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
                         <button type="submit" className="pm-btn-submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                     </div>
                 </form>
            </div>
        </div>
    );
}

export default WriteReviewModal;


