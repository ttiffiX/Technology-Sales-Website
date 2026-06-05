export const formatNotificationType = (type) => {
    const typeMap = {
        'NEW_ORDER': 'Orders',
        'NEW_REVIEW': 'Reviews',
        // Thêm các type khác ở đây nếu sau này hệ thống mở rộng
    };
    return typeMap[type] || type;
};