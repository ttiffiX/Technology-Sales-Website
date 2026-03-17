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

