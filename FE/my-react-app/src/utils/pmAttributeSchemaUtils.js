export const ATTRIBUTE_DATA_TYPES = ['Text', 'Number', 'Boolean', 'List'];

export const EMPTY_ATTRIBUTE_SCHEMA_FORM = {
    code: '',
    name: '',
    unit: '',
    dataType: 'Text',
    isFilterable: false,
    groupId: '',
};

export const mapAttributeSchemaToForm = (item = {}) => ({
    code: item.code || '',
    name: item.name || '',
    unit: item.unit || '',
    dataType: item.dataType || 'Text',
    isFilterable: Boolean(item.isFilterable),
    groupId: item.groupId || '',
});

export const validateAttributeSchemaForm = (form) => {
    if (!form.code.trim()) return 'Code is required';
    if (!/^[a-z0-9_]+$/.test(form.code.trim())) return 'Code must be lowercase, numbers or underscore only';
    if (!form.name.trim()) return 'Name is required';
    if (!Number(form.groupId)) return 'Group is required';
    if (!form.dataType) return 'Data type is required';
    return '';
};

export const buildAttributeSchemaPayload = (form) => ({
    code: form.code.trim(),
    name: form.name.trim(),
    unit: form.unit.trim(),
    dataType: form.dataType,
    isFilterable: Boolean(form.isFilterable),
    groupId: Number(form.groupId),
});

