const formatBooleanVi = (value) => (value ? 'Có' : 'Không');

const isBooleanLikeString = (value) => {
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'false';
};

const parseBooleanLikeString = (value) => value.trim().toLowerCase() === 'true';

export const formatProductAttributeValue = (value) => {
    if (value === true || value === false) {
        return formatBooleanVi(value);
    }

    if (isBooleanLikeString(value)) {
        return formatBooleanVi(parseBooleanLikeString(value));
    }

    if (Array.isArray(value)) {
        const formattedItems = value
            .map((item) => {
                if (item === true || item === false) {
                    return formatBooleanVi(item);
                }

                if (isBooleanLikeString(item)) {
                    return formatBooleanVi(parseBooleanLikeString(item));
                }

                return item == null ? '' : String(item);
            })
            .filter((item) => item !== '');

        return formattedItems.length > 0 ? formattedItems.join(', ') : '-';
    }

    if (value == null || value === '') {
        return '-';
    }

    return String(value);
};


