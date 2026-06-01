import React from 'react';

export const formatAverage = (avg) => {
    if (avg == null) return '0.0';
    return Number(avg).toFixed(1);
};

export const percentForCount = (count, total) => {
    if (!total || total <= 0) return 0;
    return Math.round((count / total) * 100);
};

export const starsArray = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const arr = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= full) arr.push('full');
        else if (i === full + 1 && half) arr.push('half');
        else arr.push('empty');
    }
    return arr;
};

export const StarDisplay = ({ rating = 0, className = '', showValue = false, valueSuffix = '/5' }) => {
    const stars = starsArray(Number(rating) || 0);

    return (
        <div className={`stars-display ${className}`.trim()}>
            {stars.map((type, index) => (
                <span
                    key={`${type}-${index}`}
                    className={`star${type === 'filled' || type === 'full' ? ' filled' : ''}${type === 'half' ? ' half' : ''}`}
                >
                    ★
                </span>
            ))}
            {showValue && (
                <span className="star-display-value">
                    {Number(rating || 0).toFixed(1)} {valueSuffix}
                </span>
            )}
        </div>
    );
};

