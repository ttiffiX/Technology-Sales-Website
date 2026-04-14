const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeAdminUserFilterParams = ({
    keyword = '',
    role = '',
    page = 0,
    size = 10,
} = {}) => {
    const params = { page, size };

    const trimmedKeyword = String(keyword).trim();
    if (trimmedKeyword) {
        params.keyword = trimmedKeyword;
    }

    const trimmedRole = String(role).trim();
    if (trimmedRole) {
        params.role = trimmedRole;
    }

    return params;
};

export const normalizeAdminUserPageResponse = (rawData) => {
    const pageData = rawData?.data && typeof rawData.data === 'object' ? rawData.data : rawData;

    if (Array.isArray(pageData)) {
        return {
            content: pageData,
            pageNumber: 0,
            totalPages: pageData.length ? 1 : 0,
            totalElements: pageData.length,
            pageSize: pageData.length,
        };
    }

    const content = Array.isArray(pageData?.content) ? pageData.content : [];
    const pageMeta = pageData?.page && typeof pageData.page === 'object' ? pageData.page : pageData;

    return {
        content,
        pageNumber: toSafeNumber(pageMeta?.number ?? pageData?.pageNumber, 0),
        totalPages: toSafeNumber(pageMeta?.totalPages ?? pageData?.totalPages, 0),
        totalElements: toSafeNumber(pageMeta?.totalElements ?? pageData?.totalElements, content.length),
        pageSize: toSafeNumber(pageMeta?.size ?? pageData?.pageSize, content.length),
    };
};
