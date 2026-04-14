export const buildPaginationItems = (currentPage, totalPages, siblingCount = 1) => {
    if (!Number.isFinite(totalPages) || totalPages <= 0) {
        return [];
    }

    const page = Math.min(Math.max(0, Number(currentPage) || 0), totalPages - 1);
    const pages = new Set([0, totalPages - 1]);

    for (let index = page - siblingCount; index <= page + siblingCount; index += 1) {
        if (index > 0 && index < totalPages - 1) {
            pages.add(index);
        }
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];

    sorted.forEach((item, index) => {
        if (index > 0 && item - sorted[index - 1] > 1) {
            result.push('ellipsis');
        }
        result.push(item);
    });

    return result;
};

