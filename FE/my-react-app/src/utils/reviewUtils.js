export const ratingLabel = (rating) => {
    switch (rating) {
        case 5:
            return 'Rất tốt';
        case 4:
            return 'Tốt';
        case 3:
            return 'Bình thường';
        case 2:
            return 'Kém';
        case 1:
            return 'Rất kém';
        default:
            return '';
    }
};

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

export default {
    ratingLabel,
    formatAverage,
    percentForCount,
    starsArray,
};

