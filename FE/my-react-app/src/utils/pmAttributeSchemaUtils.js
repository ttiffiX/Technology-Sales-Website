export const ATTRIBUTE_DATA_TYPES = ['Text', 'Number', 'Boolean', 'List'];

export const EMPTY_ATTRIBUTE_SCHEMA_FORM = {
    code: '',
    name: '',
    unit: '',
    dataType: 'Text',
    isFilterable: false,
    groupId: '',
};

export const EMPTY_ATTRIBUTE_GROUP_FORM = {
    name: '',
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

export const mapAttributeSchemaValidationMessageToFieldError = (message) => {
    const lowered = String(message || '').toLowerCase();
    if (lowered.includes('code')) return { code: message };
    if (lowered.includes('name')) return { name: message };
    if (lowered.includes('group')) return { groupId: message };
    if (lowered.includes('data type')) return { dataType: message };
    return { general: message };
};

export const validateAttributeGroupForm = (form) => {
    if (!form?.name?.trim()) return 'Group name is required';
    return '';
};

export const buildAttributeGroupPayload = (categoryId, form) => ({
    categoryId: Number(categoryId),
    name: form.name.trim(),
});

export const buildAttributeSchemaPayload = (form) => ({
    code: form.code.trim(),
    name: form.name.trim(),
    unit: form.unit.trim(),
    dataType: form.dataType,
    isFilterable: Boolean(form.isFilterable),
    groupId: Number(form.groupId),
});

export const reorderIdsByDnD = (currentIds, result) => {
    const { source, destination } = result || {};
    if (!destination) return currentIds;
    if (source.index === destination.index) return currentIds;

    const nextDraft = [...currentIds];
    const [moved] = nextDraft.splice(source.index, 1);
    nextDraft.splice(destination.index, 0, moved);
    return nextDraft;
};

export const mapDraftIdsToItems = (items, draftIds, idField) => {
    if (!Array.isArray(items) || !Array.isArray(draftIds) || !idField || draftIds.length === 0) {
        return items || [];
    }

    const itemMap = new Map(items.map((item) => [item[idField], item]));
    return draftIds.map((id) => itemMap.get(id)).filter(Boolean);
};

