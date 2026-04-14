const resolveAttributeType = (dataType = '') => dataType.toString().trim().toUpperCase();

const isBooleanType = (type) => type.includes('BOOLEAN') || type.includes('BOOL');

const isNumberType = (type) => (
    type.includes('NUMBER') ||
    type.includes('INT') ||
    type.includes('FLOAT') ||
    type.includes('DOUBLE') ||
    type.includes('DECIMAL')
);

const isListType = (type) => type.includes('LIST') || type.includes('MULTI');

export const getAttributeInputVariant = (dataType) => {
    const type = resolveAttributeType(dataType);

    if (isBooleanType(type)) return 'boolean';
    if (isNumberType(type)) return 'number';
    if (isListType(type)) return 'list';

    return 'text';
};

export const normalizeAttributeValue = (rawValue, dataType) => {
    const type = resolveAttributeType(dataType);
    const listType = isListType(type);

    if (rawValue === undefined || rawValue === null) {
        return undefined;
    }

    if (listType) {
        if (Array.isArray(rawValue)) {
            const items = rawValue
                .map((item) => (item === null || item === undefined ? '' : String(item).trim()))
                .filter(Boolean);

            return items.length > 0 ? items : undefined;
        }

        if (typeof rawValue === 'string') {
            const item = rawValue.trim();
            return item ? [item] : undefined;
        }

        return undefined;
    }

    if (typeof rawValue === 'string') {
        const trimmedValue = rawValue.trim();

        if (!trimmedValue) {
            return undefined;
        }

        if (isBooleanType(type)) {
            if (trimmedValue.toLowerCase() === 'true') return true;
            if (trimmedValue.toLowerCase() === 'false') return false;
            return undefined;
        }

        if (isNumberType(type)) {
            const parsedNumber = Number(trimmedValue);
            return Number.isNaN(parsedNumber) ? undefined : parsedNumber;
        }

        return trimmedValue;
    }

    if (typeof rawValue === 'boolean') {
        return rawValue;
    }

    if (typeof rawValue === 'number') {
        return Number.isNaN(rawValue) ? undefined : rawValue;
    }

    return rawValue;
};

export const buildAddProductPayload = (productRequest, attributeSchemas = []) => {
    const normalizedAttributes = {};

    attributeSchemas.forEach((attribute) => {
        const normalizedValue = normalizeAttributeValue(
            productRequest?.attributes?.[attribute.code],
            attribute.dataType
        );

        if (normalizedValue !== undefined) {
            normalizedAttributes[attribute.code] = normalizedValue;
        }
    });

    return {
        categoryId: Number(productRequest.categoryId),
        title: (productRequest.title || '').trim(),
        description: (productRequest.description || '').trim(),
        price: Number(productRequest.price),
        quantity: Number(productRequest.quantity),
        ...(productRequest.quantitySold !== '' && productRequest.quantitySold !== undefined && productRequest.quantitySold !== null
            ? { quantitySold: Number(productRequest.quantitySold) }
            : {}),
        imageUrl: (productRequest.imageUrl || '').trim(),
        isActive: productRequest.isActive !== false,
        attributes: normalizedAttributes,
    };
};

export const groupAttributesByGroupName = (attributes = []) => {
    const groups = [];
    const groupMap = new Map();

    attributes.forEach((attribute) => {
        const groupName = attribute.groupName || 'Additional Information';

        if (!groupMap.has(groupName)) {
            const nextGroup = { groupName, items: [] };
            groupMap.set(groupName, nextGroup);
            groups.push(nextGroup);
        }

        groupMap.get(groupName).items.push(attribute);
    });

    return groups;
};

export const flattenPMDetailAttributes = (attributeGroups = {}) => {
    if (!attributeGroups || typeof attributeGroups !== 'object') {
        return [];
    }

    return Object.values(attributeGroups)
        .filter(Boolean)
        .flatMap((group) => {
            const groupName = group?.groupName || 'Additional Information';
            const filterAttributes = Array.isArray(group?.filterAttributes) ? group.filterAttributes : [];

            return filterAttributes.map((attribute) => ({
                groupName,
                attributeName: attribute?.attributeName,
                availableValues: attribute?.availableValues,
            }));
        })
        .filter((item) => item.attributeName);
};

export const buildPMDetailAttributeValues = (detailAttributes = {}, attributeSchemas = []) => {
    const attributeValues = {};
    const flattenedDetailAttributes = flattenPMDetailAttributes(detailAttributes);

    attributeSchemas.forEach((schema) => {
        const detailAttribute = flattenedDetailAttributes.find((item) => (
            item.groupName === schema.groupName && item.attributeName === schema.name
        )) || flattenedDetailAttributes.find((item) => item.attributeName === schema.name);

        if (!detailAttribute) {
            return;
        }

        const inputVariant = getAttributeInputVariant(schema.dataType);
        const rawValue = detailAttribute.availableValues;

        if (inputVariant === 'list') {
            attributeValues[schema.code] = Array.isArray(rawValue) ? rawValue.map((item) => String(item ?? '')) : [String(rawValue ?? '')];
            return;
        }

        if (inputVariant === 'boolean') {
            if (typeof rawValue === 'boolean') {
                attributeValues[schema.code] = String(rawValue);
                return;
            }

            if (typeof rawValue === 'string') {
                const normalizedBoolean = rawValue.trim().toLowerCase();
                if (normalizedBoolean === 'true' || normalizedBoolean === 'false') {
                    attributeValues[schema.code] = normalizedBoolean;
                }
            }
            return;
        }

        attributeValues[schema.code] = rawValue ?? '';
    });

    return attributeValues;
};

export const buildUpdateProductPayload = (productForm, attributeSchemas = [], detailAttributes = {}, editedAttributeValues = null) => {
    const normalizedAttributes = {};
    const flattenedDetailAttributes = flattenPMDetailAttributes(detailAttributes);

    attributeSchemas.forEach((schema) => {
        const rawValue = editedAttributeValues
            ? editedAttributeValues[schema.code]
            : (() => {
                const detailAttribute = flattenedDetailAttributes.find((item) => (
                    item.groupName === schema.groupName && item.attributeName === schema.name
                )) || flattenedDetailAttributes.find((item) => item.attributeName === schema.name);

                return detailAttribute?.availableValues;
            })();

        const normalizedValue = normalizeAttributeValue(rawValue, schema.dataType);
        if (normalizedValue !== undefined) {
            normalizedAttributes[schema.code] = normalizedValue;
        }
    });

    return {
        categoryId: Number(productForm.categoryId),
        title: (productForm.title || '').trim(),
        description: (productForm.description || '').trim(),
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
        ...(productForm.quantitySold !== '' && productForm.quantitySold !== undefined && productForm.quantitySold !== null
            ? { quantitySold: Number(productForm.quantitySold) }
            : {}),
        imageUrl: (productForm.imageUrl || '').trim(),
        isActive: productForm.isActive !== false,
        attributes: normalizedAttributes,
    };
};

export const validatePMProductForm = (productForm) => {
    const nextErrors = {};

    if (!productForm.categoryId) {
        nextErrors.categoryId = 'Please choose a category';
    }

    if (!productForm.title?.trim()) {
        nextErrors.title = 'Title is required';
    }

    if (productForm.price === '') {
        nextErrors.price = 'Price is required';
    } else if (Number.isNaN(Number(productForm.price)) || Number(productForm.price) < 0) {
        nextErrors.price = 'Price must be a valid number >= 0';
    }

    if (productForm.quantity === '') {
        nextErrors.quantity = 'Quantity is required';
    } else if (Number.isNaN(Number(productForm.quantity)) || Number(productForm.quantity) < 0) {
        nextErrors.quantity = 'Quantity must be a valid number >= 0';
    }

    if (
        productForm.quantitySold !== '' &&
        (Number.isNaN(Number(productForm.quantitySold)) || Number(productForm.quantitySold) < 0)
    ) {
        nextErrors.quantitySold = 'Quantity sold must be a valid number >= 0';
    }

    return nextErrors;
};

export const normalizePMProductPageResponse = (rawData) => {
    const pageData = rawData?.data && typeof rawData.data === 'object' ? rawData.data : rawData;

    const toSafeNumber = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    if (Array.isArray(pageData)) {
        return {
            content: pageData,
            pageNumber: 0,
            totalPages: 1,
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

export const normalizePMProductFilterParams = ({
    keyword = '',
    categoryId = '',
    minPrice = '',
    maxPrice = '',
    sort = 'id,desc',
    page = 0,
    size = 10,
} = {}) => {
    const params = {
        page,
        size,
    };

    // Normalize keyword
    const trimmedKeyword = String(keyword).trim();
    if (trimmedKeyword) {
        params.keyword = trimmedKeyword;
    }

    // Normalize categoryId
    const parsedCategoryId = Number(categoryId);
    if (!Number.isNaN(parsedCategoryId) && parsedCategoryId > 0) {
        params.categoryId = parsedCategoryId;
    }

    // Normalize minPrice
    if (minPrice !== '' && minPrice !== null && minPrice !== undefined) {
        const parsedMinPrice = Number(minPrice);
        if (!Number.isNaN(parsedMinPrice) && parsedMinPrice >= 0) {
            params.minPrice = parsedMinPrice;
        }
    }

    // Normalize maxPrice
    if (maxPrice !== '' && maxPrice !== null && maxPrice !== undefined) {
        const parsedMaxPrice = Number(maxPrice);
        if (!Number.isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
            params.maxPrice = parsedMaxPrice;
        }
    }

    // Add sort if provided
    if (sort) {
        params.sort = sort;
    }

    return params;
};
