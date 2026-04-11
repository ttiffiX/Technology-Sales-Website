import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { getAllCategories } from '../../../../api/customer/ProductAPI';
import {
    addAttributeSchema,
    deleteAttributeSchema,
    getAttributeSchemasByCategory,
    updateAttributeSchema,
    updateAttributeDisplayOrder,
} from '../../../../api/pm/product/AttributeAPI';
import { useToast } from '../../../../components/Toast/Toast';
import {
    EMPTY_ATTRIBUTE_SCHEMA_FORM,
    mapAttributeSchemaToForm,
    validateAttributeSchemaForm,
    buildAttributeSchemaPayload,
    getSuccessMessage,
    getApiErrorMessage,
    mapApiFieldErrors,
} from '../../../../utils';
import AttributeSchemaModal from '../../../../components/modal/add_attribute/AttributeSchemaModal';
import AttributeGroupAccordion from './AttributeGroupAccordion.js';
import './PMAttributeSchemaManagement.scss';

function PMAttributeSchemaManagement() {
    const navigate = useNavigate();
    const { triggerToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [attributeGroups, setAttributeGroups] = useState([]);
    const [loadingAttributes, setLoadingAttributes] = useState(false);

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

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const selectedCategoryId = useMemo(() => Number(categoryId), [categoryId]);

    const sortedGroups = useMemo(
        () => [...attributeGroups].sort((a, b) => (a.groupOrder || 0) - (b.groupOrder || 0)),
        [attributeGroups]
    );

    const loadCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (_error) {
            triggerToast('error', 'Failed to load categories');
        }
    };

    const loadAttributes = async (nextCategoryId) => {
        if (!nextCategoryId) {
            setAttributeGroups([]);
            return;
        }

        setLoadingAttributes(true);
        try {
            const data = await getAttributeSchemasByCategory(nextCategoryId);
            setAttributeGroups(Array.isArray(data) ? data : []);
        } catch (_error) {
            setAttributeGroups([]);
            triggerToast('error', 'Failed to load attribute schema list');
        } finally {
            setLoadingAttributes(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        setAddOpen(false);
        setEditOpen(false);
        setDeleteTarget(null);
        setActiveReorderGroupId(null);
        setReorderDraftIds([]);
        setExpandedGroupIds(new Set());
        setAddForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
        setEditForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
        setAddErrors({});
        setEditErrors({});
        loadAttributes(selectedCategoryId);
    }, [selectedCategoryId]);

    const handleFormChange = (setter, setErrors) => (event) => {
        const { name, value, type, checked } = event.target;
        setter((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (setErrors) {
            setErrors((prev) => {
                if (!prev[name] && !prev.general) {
                    return prev;
                }
                const next = { ...prev };
                delete next[name];
                delete next.general;
                return next;
            });
        }
    };

    const mapLocalValidationToFieldError = (message) => {
        const lowered = String(message || '').toLowerCase();
        if (lowered.includes('code')) return { code: message };
        if (lowered.includes('name')) return { name: message };
        if (lowered.includes('group')) return { groupId: message };
        if (lowered.includes('data type')) return { dataType: message };
        return { general: message };
    };


    const toggleGroupExpanded = (groupId) => {
        setExpandedGroupIds((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
                if (activeReorderGroupId === groupId) {
                    cancelReorderMode();
                }
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    const getGroupItems = (group) => {
        const items = Array.isArray(group.categoryAttributeList) ? group.categoryAttributeList : [];
        if (activeReorderGroupId !== group.groupId || reorderDraftIds.length === 0) {
            return items;
        }

        const itemMap = new Map(items.map((item) => [item.attributeId, item]));
        return reorderDraftIds.map((id) => itemMap.get(id)).filter(Boolean);
    };

    const openAddModal = () => {
        const defaultGroupId = sortedGroups[0]?.groupId || '';
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
            setAddErrors(mapLocalValidationToFieldError(errorText));
            return;
        }

        setAddLoading(true);
        setAddErrors({});
        try {
            const payload = buildAttributeSchemaPayload(addForm);
            const result = await addAttributeSchema(selectedCategoryId, payload);
            await loadAttributes(selectedCategoryId);
            setAddOpen(false);
            setAddForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
            setAddErrors({});
            triggerToast('success', getSuccessMessage(result, 'Attribute schema added successfully'));
        } catch (error) {
            const mappedErrors = mapApiFieldErrors(error, 'Failed to add attribute schema');
            setAddErrors(mappedErrors);
            if (mappedErrors.general) {
                triggerToast('error', mappedErrors.general);
            }
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
            setEditErrors(mapLocalValidationToFieldError(errorText));
            return;
        }

        setEditLoading(true);
        setEditErrors({});
        try {
            const payload = buildAttributeSchemaPayload(editForm);
            const result = await updateAttributeSchema(editingId, payload);
            await loadAttributes(selectedCategoryId);
            setEditOpen(false);
            setEditingId(null);
            setEditForm({ ...EMPTY_ATTRIBUTE_SCHEMA_FORM, groupId: '' });
            setEditErrors({});
            triggerToast('success', getSuccessMessage(result, 'Attribute schema updated successfully'));
        } catch (error) {
            const mappedErrors = mapApiFieldErrors(error, 'Failed to update attribute schema');
            setEditErrors(mappedErrors);
            if (mappedErrors.general) {
                triggerToast('error', mappedErrors.general);
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteAttribute = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);
        try {
            const result = await deleteAttributeSchema(deleteTarget.attributeId);
            await loadAttributes(selectedCategoryId);
            triggerToast('success', getSuccessMessage(result, 'Attribute schema deleted successfully'));
            setDeleteTarget(null);
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to delete attribute schema'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const startReorderMode = (groupId) => {
        const group = sortedGroups.find((item) => item.groupId === groupId);
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
            await loadAttributes(selectedCategoryId);
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

        const nextDraft = [...reorderDraftIds];
        const [moved] = nextDraft.splice(source.index, 1);
        nextDraft.splice(destination.index, 0, moved);
        setReorderDraftIds(nextDraft);
    };

    return (
        <div className="pm-attr-page">
            <div className="pm-attr-header">
                <h2>Attributes</h2>
                <p>Manage attribute schemas by category</p>
            </div>

            <div className="pm-attr-content">
                <div className="pm-attr-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm/products')}>
                        Back to Product Workspace
                    </button>

                    <select
                        className="pm-attr-category-select"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                    >
                        <option value="">Choose category</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <button className="pm-btn-add" onClick={openAddModal} disabled={!selectedCategoryId}>
                        Add Attribute
                    </button>
                </div>

                {!selectedCategoryId ? (
                    <div className="pm-attr-placeholder">
                        <p>Please choose a category to view attributes.</p>
                    </div>
                ) : loadingAttributes ? (
                    <div className="pm-attr-placeholder">
                        <p>Loading attributes...</p>
                    </div>
                ) : sortedGroups.length === 0 ? (
                    <div className="pm-attr-placeholder">
                        <p>No attribute groups found in this category.</p>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="pm-attr-groups">
                            {sortedGroups.map((group) => (
                                <AttributeGroupAccordion
                                    key={group.groupId}
                                    group={group}
                                    rows={getGroupItems(group)}
                                    isExpanded={expandedGroupIds.has(group.groupId)}
                                    onToggleExpanded={() => toggleGroupExpanded(group.groupId)}
                                    isReorderMode={activeReorderGroupId === group.groupId}
                                    isReorderBusy={reorderSaving}
                                    onStartReorder={() => startReorderMode(group.groupId)}
                                    onCancelReorder={cancelReorderMode}
                                    onSaveReorder={saveReorderMode}
                                    onEdit={openEditModal}
                                    onAskDelete={(attribute) => setDeleteTarget(attribute)}
                                />
                            ))}
                        </div>
                    </DragDropContext>
                )}
            </div>

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
                attributeGroups={sortedGroups}
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
                attributeGroups={sortedGroups}
            />

            {deleteTarget && (
                <div className="pm-confirm-overlay" onClick={() => !deleteLoading && setDeleteTarget(null)}>
                    <div className="pm-confirm-dialog" onClick={(event) => event.stopPropagation()}>
                        <h4>Delete Attribute</h4>
                        <p>
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                        </p>
                        <div className="pm-confirm-actions">
                            <button
                                type="button"
                                className="pm-confirm-cancel"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="pm-confirm-delete"
                                onClick={handleDeleteAttribute}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PMAttributeSchemaManagement;


