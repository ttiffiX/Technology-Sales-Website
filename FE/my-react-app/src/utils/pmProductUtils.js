const resolveAttributeType = (dataType = '') => dataType.toString().trim().toUpperCase();

const isBooleanType = (type) => type.includes('BOOLEAN') || type.includes('BOOL');

const isNumberType = (type) => (
    type.includes('NUMBER') ||
    type.includes('INT') ||
    type.includes('FLOAT') ||
    type.includes('DOUBLE') ||
    type.includes('DECIMAL')
);

const isListType = (type) => type.includes('ARRAY') || type.includes('LIST') || type.includes('MULTI');

export const getAttributeInputVariant = (dataType) => {
    const type = resolveAttributeType(dataType);

    if (isBooleanType(type)) return 'boolean';
    if (isNumberType(type)) return 'number';
    if (isListType(type)) return 'list';

    return 'text';
};

export const normalizeAttributeValue = (rawValue, dataType) => {
    const type = resolveAttributeType(dataType);

    if (rawValue === undefined || rawValue === null) {
        return undefined;
    }

    if (typeof rawValue === 'string') {
        const trimmedValue = rawValue.trim();

        if (!trimmedValue) {
            return undefined;
        }

        if (isBooleanType(type)) {
            return trimmedValue.toLowerCase() === 'true';
        }

        if (isNumberType(type)) {
            const parsedNumber = Number(trimmedValue);
            return Number.isNaN(parsedNumber) ? undefined : parsedNumber;
        }

        if (isListType(type)) {
            const items = trimmedValue
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            return items.length > 0 ? items : undefined;
        }

        return trimmedValue;
    }

    if (typeof rawValue === 'boolean') {
        return rawValue;
    }

    if (typeof rawValue === 'number') {
        return Number.isNaN(rawValue) ? undefined : rawValue;
    }

    if (Array.isArray(rawValue)) {
        const items = rawValue
            .map((item) => (typeof item === 'string' ? item.trim() : item))
            .filter((item) => item !== '' && item !== undefined && item !== null);

        return items.length > 0 ? items : undefined;
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

