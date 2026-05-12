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

export const normalizePageResponse = (rawData) => {
    const pageData = rawData?.data && typeof rawData.data === 'object' ? rawData.data : rawData;

    if (Array.isArray(pageData)) {
        return {
            content: pageData,
            pageNumber: 0,
            totalPages: pageData.length > 0 ? 1 : 0,
            totalElements: pageData.length,
            pageSize: pageData.length,
        };
    }

    const content = Array.isArray(pageData?.content) ? pageData.content : [];
    const pageMeta = pageData?.page && typeof pageData.page === 'object' ? pageData.page : pageData;

    return {
        content,
        pageNumber: Number.isFinite(pageMeta?.number ?? pageData?.pageNumber) ? Number(pageMeta?.number ?? pageData?.pageNumber) : 0,
        totalPages: Number.isFinite(pageMeta?.totalPages ?? pageData?.totalPages) ? Number(pageMeta?.totalPages ?? pageData?.totalPages) : 0,
        totalElements: Number.isFinite(pageMeta?.totalElements ?? pageData?.totalElements) ? Number(pageMeta?.totalElements ?? pageData?.totalElements) : content.length,
        pageSize: Number.isFinite(pageMeta?.size ?? pageData?.pageSize) ? Number(pageMeta?.size ?? pageData?.pageSize) : content.length,
    };
};

