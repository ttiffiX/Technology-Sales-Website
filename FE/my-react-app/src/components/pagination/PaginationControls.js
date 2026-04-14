import React from 'react';
import { buildPaginationItems } from '../../utils';
import './PaginationControls.scss';

function PaginationControls({
    page = 0,
    totalPages = 0,
    totalElements = 0,
    onPageChange,
    disabled = false,
}) {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    const items = buildPaginationItems(page, totalPages);

    return (
        <div className="pm-pagination" aria-label="Pagination">
            <div className="pm-pagination__meta">
                {totalElements} item{totalElements === 1 ? '' : 's'}
            </div>
            <div className="pm-pagination__controls">
                <button
                    type="button"
                    className="pm-pagination__btn"
                    onClick={() => onPageChange(Math.max(0, page - 1))}
                    disabled={disabled || page === 0}
                >
                    Prev
                </button>

                {items.map((item, index) => (
                    item === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="pm-pagination__ellipsis">...</span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            className={`pm-pagination__btn ${item === page ? 'is-active' : ''}`}
                            onClick={() => onPageChange(item)}
                            disabled={disabled}
                        >
                            {item + 1}
                        </button>
                    )
                ))}

                <button
                    type="button"
                    className="pm-pagination__btn"
                    onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                    disabled={disabled || page >= totalPages - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default PaginationControls;

