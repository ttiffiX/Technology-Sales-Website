export const ATTRIBUTE_DATA_TYPES = ['TEXT', 'NUMBER', 'BOOLEAN', 'LIST'];

export const EMPTY_ATTRIBUTE_SCHEMA_FORM = {
    code: '',
    name: '',
    unit: '',
    dataType: 'TEXT',
    isFilterable: false,
    groupName: '',
    groupOrder: 1,
    displayOrder: 1,
};

export const mapAttributeSchemaToForm = (item = {}) => ({
    code: item.code || '',
    name: item.name || '',
    unit: item.unit || '',
    dataType: item.dataType || 'TEXT',
    isFilterable: Boolean(item.isFilterable),
    groupName: item.groupName || '',
    groupOrder: item.groupOrder || 1,
    displayOrder: item.displayOrder || 1,
});

export const validateAttributeSchemaForm = (form) => {
    if (!form.code.trim()) return 'Code is required';
    if (!/^[a-z0-9_]+$/.test(form.code.trim())) return 'Code must be lowercase, numbers or underscore only';
    if (!form.name.trim()) return 'Name is required';
    if (!form.groupName.trim()) return 'Group name is required';
    if (!form.dataType) return 'Data type is required';
    if (!Number(form.groupOrder) || Number(form.groupOrder) < 1) return 'Group order must be >= 1';
    if (!Number(form.displayOrder) || Number(form.displayOrder) < 1) return 'Display order must be >= 1';
    return '';
};

export const buildAttributeSchemaPayload = (form) => ({
    code: form.code.trim(),
    name: form.name.trim(),
    unit: form.unit.trim(),
    dataType: form.dataType,
    isFilterable: Boolean(form.isFilterable),
    groupName: form.groupName.trim(),
    groupOrder: Number(form.groupOrder),
    displayOrder: Number(form.displayOrder),
});

