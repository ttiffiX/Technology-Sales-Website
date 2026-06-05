// Hàm tiện ích lấy param ban đầu
export const getInitialValue = (searchParams, key, fallback = '') => searchParams.get(key) || fallback;

export const getInitialPage = (searchParams) => {
    const parsed = Number.parseInt(searchParams.get('page') || '0', 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};