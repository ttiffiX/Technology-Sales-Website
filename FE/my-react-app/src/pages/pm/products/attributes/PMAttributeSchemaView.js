import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { addAttributeSchema, deleteAttributeSchema, getAttributeSchemasByCategory, updateAttributeSchema, updateAttributeDisplayOrder } from '../../../../api/pm/product/AttributeAPI';
import { useToast } from '../../../../components/Toast/Toast';
import AttributeSchemaModal from '../../../../components/modal/add_attribute/AttributeSchemaModal';
import AttributeGroupAccordion from './AttributeGroupAccordion.js';
import {
    EMPTY_ATTRIBUTE_SCHEMA_FORM,
    buildAttributeSchemaPayload,
    getApiErrorMessage,
    getSuccessMessage,
    mapApiFieldErrors,
    mapAttributeSchemaToForm,
    mapAttributeSchemaValidationMessageToFieldError,
    mapDraftIdsToItems,
    reorderIdsByDnD,
    validateAttributeSchemaForm,
} from '../../../../utils';

function PMAttributeSchemaView({ categoryId }) {
    const { triggerToast } = useToast();
    const selectedCategoryId = useMemo(() => Number(categoryId), [categoryId]);

    const [schemaGroups, setSchemaGroups] = useState([]);
    const [loadingSchemas, setLoadingSchemas] = useState(false);
    const [expandedGroupIds, setExpandedGroupIds] = useState(new Set());

    const [activeReorderGroupId, setActiveReorderGroupId] = useState(null);
    const [reorderDraftIds, setReorderDraftIds] = useState([]);
    const [reorderSaving, setReorderSaving] = useState(false);

    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState(EMPTY_ATTRIBUTE_SCHEMA_FORM);
    const [addErrors, setAddErrors] = useState({});
    const [addLoading, setAddLoading] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_ATTRIBUTE_SCHEMA_FORM);
    const [editErrors, setEditErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    const sortedSchemaGroups = useMemo(
        () => [...schemaGroups].sort((a, b) => (a.groupOrder || 0) - (b.groupOrder || 0)),
        [schemaGroups]
    );

    const schemaModalGroups = useMemo(
        () => sortedSchemaGroups.map((group) => ({
            groupId: group.groupId,
            groupName: group.groupName,
            groupOrder: group.groupOrder,
        })),
        [sortedSchemaGroups]
    );

    const loadSchemaGroups = async (nextCategoryId) => {
        if (!nextCategoryId) {
            setSchemaGroups([]);
            return;
        }

        setLoadingSchemas(true);
        try {
            const data = await getAttributeSchemasByCategory(nextCategoryId);
            setSchemaGroups(Array.isArray(data) ? data : []);
        } catch (_error) {
            setSchemaGroups([]);
            triggerToast('error', 'Failed to load attribute schema list');
        } finally {
            setLoadingSchemas(false);
        }
    };

    useEffect(() => {
        setSchemaGroups([]);
        setExpandedGroupIds(new Set());
        setActiveReorderGroupId(null);
        setReorderDraftIds([]);
        setAddOpen(false);
        setEditOpen(false);
        setEditingId(null);
        setAddForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
        setEditForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
        setAddErrors({});
        setEditErrors({});
        loadSchemaGroups(selectedCategoryId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId]);

    const handleFormChange = (setter, setErrors) => (event) => {
        const { name, value, type, checked } = event.target;
        setter((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (setErrors) {
            setErrors((prev) => {
                if (!prev[name] && !prev.general) return prev;
                const next = { ...prev };
                delete next[name];
                delete next.general;
                return next;
            });
        }
    };

    const getGroupItems = (group) => {
        const items = Array.isArray(group.categoryAttributeList) ? group.categoryAttributeList : [];
        if (activeReorderGroupId !== group.groupId || reorderDraftIds.length === 0) {
            return items;
        }
        return mapDraftIdsToItems(items, reorderDraftIds, 'attributeId');
    };

    const openAddModal = () => {
        const defaultGroupId = sortedSchemaGroups[0]?.groupId || '';
        setAddForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: defaultGroupId });
        setAddErrors({});
        setAddOpen(true);
    };

    const handleAddAttribute = async () => {
        if (!selectedCategoryId) {
            triggerToast('error', 'Please choose a category first');
            return;
        }

        const errorText = validateAttributeSchemaForm(addForm);
        if (errorText) {
            setAddErrors(mapAttributeSchemaValidationMessageToFieldError(errorText));
            return;
        }

        setAddLoading(true);
        setAddErrors({});
        try {
            const payload = buildAttributeSchemaPayload(addForm);
            const result = await addAttributeSchema(selectedCategoryId, payload);
            await loadSchemaGroups(selectedCategoryId);
            setAddOpen(false);
            setAddForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
            setAddErrors({});
            triggerToast('success', getSuccessMessage(result, 'Attribute schema added successfully'));
        } catch (error) {
            const mappedErrors = mapApiFieldErrors(error, 'Failed to add attribute schema');
            setAddErrors(mappedErrors);
            if (mappedErrors.general) triggerToast('error', mappedErrors.general);
        } finally {
            setAddLoading(false);
        }
    };

    const openEditModal = (attribute, groupId) => {
        setEditingId(attribute.attributeId);
        setEditForm({ ...mapAttributeSchemaToForm(attribute), groupId });
        setEditErrors({});
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        const errorText = validateAttributeSchemaForm(editForm);
        if (errorText) {
            setEditErrors(mapAttributeSchemaValidationMessageToFieldError(errorText));
            return;
        }

        setEditLoading(true);
        setEditErrors({});
        try {
            const payload = buildAttributeSchemaPayload(editForm);
            const result = await updateAttributeSchema(editingId, payload);
            await loadSchemaGroups(selectedCategoryId);
            setEditOpen(false);
            setEditingId(null);
            setEditForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
            setEditErrors({});
            triggerToast('success', getSuccessMessage(result, 'Attribute schema updated successfully'));
        } catch (error) {
            const mappedErrors = mapApiFieldErrors(error, 'Failed to update attribute schema');
            setEditErrors(mappedErrors);
            if (mappedErrors.general) triggerToast('error', mappedErrors.general);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteAttribute = async (attribute) => {
        if (!attribute?.attributeId) return;
        const confirmed = window.confirm(`Delete attribute "${attribute.name}"?`);
        if (!confirmed) return;

        try {
            const result = await deleteAttributeSchema(attribute.attributeId);
            await loadSchemaGroups(selectedCategoryId);
            triggerToast('success', getSuccessMessage(result, 'Attribute schema deleted successfully'));
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to delete attribute schema'));
        }
    };

    const startReorderMode = (groupId) => {
        const group = sortedSchemaGroups.find((item) => item.groupId === groupId);
        if (!group) return;

        setActiveReorderGroupId(groupId);
        setReorderDraftIds((group.categoryAttributeList || []).map((item) => item.attributeId));
    };

    const cancelReorderMode = () => {
        setActiveReorderGroupId(null);
        setReorderDraftIds([]);
    };

    const saveReorderMode = async () => {
        if (!activeReorderGroupId || reorderDraftIds.length === 0) return;

        setReorderSaving(true);
        try {
            const result = await updateAttributeDisplayOrder(activeReorderGroupId, reorderDraftIds);
            await loadSchemaGroups(selectedCategoryId);
            triggerToast('success', getSuccessMessage(result, 'Display order updated successfully'));
            cancelReorderMode();
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to update display order'));
        } finally {
            setReorderSaving(false);
        }
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId !== destination.droppableId) return;
        if (source.index === destination.index) return;

        const groupId = Number(source.droppableId);
        if (groupId !== activeReorderGroupId) return;

        setReorderDraftIds((prev) => reorderIdsByDnD(prev, result));
    };

    if (!selectedCategoryId) {
        return (
            <div className="pm-attr-placeholder">
                <p>Please choose a category to view attributes.</p>
            </div>
        );
    }

    return (
        <>
            <div className="pm-attr-view-actions">
                <button type="button" className="pm-btn-add" onClick={openAddModal} disabled={loadingSchemas || sortedSchemaGroups.length === 0}>
                    Add Attribute
                </button>
            </div>

            {loadingSchemas ? (
                <div className="pm-attr-placeholder">
                    <p>Loading attributes...</p>
                </div>
            ) : sortedSchemaGroups.length === 0 ? (
                <div className="pm-attr-placeholder">
                    <p>No attribute schemas found in this category.</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="pm-attr-groups">
                        {sortedSchemaGroups.map((group) => (
                            <AttributeGroupAccordion
                                key={group.groupId}
                                group={group}
                                rows={getGroupItems(group)}
                                isExpanded={expandedGroupIds.has(group.groupId)}
                                onToggleExpanded={() => setExpandedGroupIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(group.groupId)) {
                                        next.delete(group.groupId);
                                        if (activeReorderGroupId === group.groupId) {
                                            cancelReorderMode();
                                        }
                                    } else {
                                        next.add(group.groupId);
                                    }
                                    return next;
                                })}
                                isReorderMode={activeReorderGroupId === group.groupId}
                                isReorderBusy={reorderSaving}
                                onStartReorder={() => startReorderMode(group.groupId)}
                                onCancelReorder={cancelReorderMode}
                                onSaveReorder={saveReorderMode}
                                onEdit={openEditModal}
                                onAskDelete={handleDeleteAttribute}
                            />
                        ))}
                    </div>
                </DragDropContext>
            )}

            <AttributeSchemaModal
                isOpen={addOpen}
                title="Add Attribute Schema"
                form={addForm}
                errors={addErrors}
                loading={addLoading}
                onChange={handleFormChange(setAddForm, setAddErrors)}
                onClose={() => {
                    setAddOpen(false);
                    setAddErrors({});
                }}
                onSubmit={handleAddAttribute}
                attributeGroups={schemaModalGroups}
            />

            <AttributeSchemaModal
                isOpen={editOpen}
                title="Update Attribute Schema"
                form={editForm}
                errors={editErrors}
                loading={editLoading}
                isCodeLocked
                onChange={handleFormChange(setEditForm, setEditErrors)}
                onClose={() => {
                    setEditOpen(false);
                    setEditingId(null);
                    setEditErrors({});
                }}
                onSubmit={handleSaveEdit}
                attributeGroups={schemaModalGroups}
            />
        </>
    );
}

export default PMAttributeSchemaView;



