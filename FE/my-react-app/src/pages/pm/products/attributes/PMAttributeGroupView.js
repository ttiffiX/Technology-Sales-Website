import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { addAttributeGroup, deleteAttributeGroup, getAttributeGroupsByCategory, updateAttributeGroup, updateAttributeGroupOrder } from '../../../../api/pm/product/AttributeGroupAPI';
import { useToast } from '../../../../components/Toast/Toast';
import AttributeGroupModal from '../../../../components/modal/add_attribute/AttributeGroupModal';
import {
    EMPTY_ATTRIBUTE_GROUP_FORM,
    buildAttributeGroupPayload,
    getApiErrorMessage,
    getSuccessMessage,
    mapDraftIdsToItems,
    reorderIdsByDnD,
    validateAttributeGroupForm,
} from '../../../../utils';

function PMAttributeGroupView({ categoryId }) {
    const { triggerToast } = useToast();
    const selectedCategoryId = useMemo(() => Number(categoryId), [categoryId]);

    const [attributeGroups, setAttributeGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);

    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [groupForm, setGroupForm] = useState({ ...EMPTY_ATTRIBUTE_GROUP_FORM });
    const [groupErrors, setGroupErrors] = useState({});
    const [groupLoading, setGroupLoading] = useState(false);

    const [groupReorderMode, setGroupReorderMode] = useState(false);
    const [groupReorderDraftIds, setGroupReorderDraftIds] = useState([]);
    const [groupReorderSaving, setGroupReorderSaving] = useState(false);

    const getOrderForSort = (group) => {
        const value = Number(group?.groupOrder);
        return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
    };

    const getNextGroupOrder = (groups) => {
        const maxOrder = (Array.isArray(groups) ? groups : []).reduce((max, item) => {
            const value = Number(item?.groupOrder);
            if (!Number.isFinite(value)) return max;
            return Math.max(max, value);
        }, 0);
        return maxOrder + 1;
    };

    const getGroupFromMutationResult = (result) => {
        if (!result || typeof result !== 'object') return null;
        const candidate = result.data && typeof result.data === 'object' ? result.data : result;
        return candidate?.id ? candidate : null;
    };

    const sortedAttributeGroups = useMemo(
        () => [...attributeGroups].sort((a, b) => getOrderForSort(a) - getOrderForSort(b)),
        [attributeGroups]
    );

    const reorderedAttributeGroups = useMemo(() => {
        if (!groupReorderMode || groupReorderDraftIds.length === 0) {
            return sortedAttributeGroups;
        }
        return mapDraftIdsToItems(sortedAttributeGroups, groupReorderDraftIds, 'id');
    }, [groupReorderMode, groupReorderDraftIds, sortedAttributeGroups]);

    const loadAttributeGroups = async (nextCategoryId) => {
        if (!nextCategoryId) {
            setAttributeGroups([]);
            return;
        }

        setLoadingGroups(true);
        try {
            const data = await getAttributeGroupsByCategory(nextCategoryId);
            setAttributeGroups(Array.isArray(data) ? data : []);
        } catch (_error) {
            setAttributeGroups([]);
            triggerToast('error', 'Failed to load attribute group list');
        } finally {
            setLoadingGroups(false);
        }
    };

    useEffect(() => {
        setAttributeGroups([]);
        setGroupModalOpen(false);
        setEditingGroupId(null);
        setGroupForm({ ...EMPTY_ATTRIBUTE_GROUP_FORM });
        setGroupErrors({});
        setGroupReorderMode(false);
        setGroupReorderDraftIds([]);
        loadAttributeGroups(selectedCategoryId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId]);

    const openAddGroupModal = () => {
        setEditingGroupId(null);
        setGroupForm({ ...EMPTY_ATTRIBUTE_GROUP_FORM });
        setGroupErrors({});
        setGroupModalOpen(true);
    };

    const openEditGroupModal = (group) => {
        setEditingGroupId(group.id);
        setGroupForm({ name: group.name || '' });
        setGroupErrors({});
        setGroupModalOpen(true);
    };

    const closeGroupModal = () => {
        setGroupModalOpen(false);
        setEditingGroupId(null);
        setGroupForm({ ...EMPTY_ATTRIBUTE_GROUP_FORM });
        setGroupErrors({});
    };

    const handleSaveGroup = async () => {
        if (!selectedCategoryId) {
            setGroupErrors({ general: 'Please choose a category first' });
            return;
        }

        const validationError = validateAttributeGroupForm(groupForm);
        if (validationError) {
            setGroupErrors({ name: validationError });
            return;
        }

        setGroupLoading(true);
        setGroupErrors({});
        try {
            const payload = buildAttributeGroupPayload(selectedCategoryId, groupForm);
            const isEditMode = Boolean(editingGroupId);
            const result = isEditMode
                ? await updateAttributeGroup(editingGroupId, payload)
                : await addAttributeGroup(payload);

            const returnedGroup = getGroupFromMutationResult(result);
            if (!returnedGroup) {
                triggerToast('error', 'Group saved but response has no group data');
                return;
            }

            setAttributeGroups((prev) => {
                if (isEditMode) {
                    return prev.map((item) => (item.id === editingGroupId ? { ...item, ...returnedGroup } : item));
                }

                const groupOrder = Number(returnedGroup.groupOrder);
                const normalized = {
                    ...returnedGroup,
                    groupOrder: Number.isFinite(groupOrder) ? groupOrder : getNextGroupOrder(prev),
                };
                return [...prev, normalized];
            });

            triggerToast('success', getSuccessMessage(null, isEditMode ? 'Attribute group updated successfully' : 'Attribute group added successfully'));
            closeGroupModal();
        } catch (error) {
            setGroupErrors({ general: getApiErrorMessage(error, 'Failed to save attribute group') });
        } finally {
            setGroupLoading(false);
        }
    };

    const handleDeleteGroup = async (group) => {
        if (!group?.id) return;
        const confirmed = window.confirm(`Delete group "${group.name}"?`);
        if (!confirmed) return;

        try {
            const result = await deleteAttributeGroup(group.id);
            setAttributeGroups((prev) => prev.filter((item) => item.id !== group.id));
            triggerToast('success', getSuccessMessage(result, 'Attribute group deleted successfully'));
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to delete attribute group'));
        }
    };

    const startGroupReorderMode = () => {
        setGroupReorderMode(true);
        setGroupReorderDraftIds(sortedAttributeGroups.map((group) => group.id));
    };

    const cancelGroupReorderMode = () => {
        setGroupReorderMode(false);
        setGroupReorderDraftIds([]);
    };

    const saveGroupReorderMode = async () => {
        if (!selectedCategoryId || groupReorderDraftIds.length === 0) return;

        setGroupReorderSaving(true);
        try {
            const result = await updateAttributeGroupOrder(selectedCategoryId, groupReorderDraftIds);
            await loadAttributeGroups(selectedCategoryId);
            triggerToast('success', getSuccessMessage(result, 'Group order updated successfully'));
            cancelGroupReorderMode();
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to update group order'));
        } finally {
            setGroupReorderSaving(false);
        }
    };

    const handleGroupDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId !== 'ATTRIBUTE_GROUPS' || destination.droppableId !== 'ATTRIBUTE_GROUPS') return;
        if (source.index === destination.index) return;

        setGroupReorderDraftIds((prev) => reorderIdsByDnD(prev, result));
    };

    if (!selectedCategoryId) {
        return (
            <div className="pm-attr-placeholder">
                <p>Please choose a category to view groups.</p>
            </div>
        );
    }

    return (
        <>
            <div className="pm-attr-view-actions">
                {!groupReorderMode ? (
                    <>
                        <button type="button" className="pm-btn-add" onClick={openAddGroupModal}>
                            Add Group
                        </button>
                        <button type="button" className="pm-btn-secondary" onClick={startGroupReorderMode} disabled={sortedAttributeGroups.length < 2}>
                            Reorder Groups
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" className="pm-btn-add" onClick={saveGroupReorderMode} disabled={groupReorderSaving}>
                            {groupReorderSaving ? 'Saving...' : 'Save Order'}
                        </button>
                        <button type="button" className="pm-btn-secondary" onClick={cancelGroupReorderMode} disabled={groupReorderSaving}>
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {loadingGroups ? (
                <div className="pm-attr-placeholder">
                    <p>Loading groups...</p>
                </div>
            ) : reorderedAttributeGroups.length === 0 ? (
                <div className="pm-attr-placeholder">
                    <p>No attribute groups found in this category.</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleGroupDragEnd}>
                    <div className="pm-group-table-wrap">
                        <table className="pm-group-table">
                            <thead>
                                <tr>
                                    <th className="pm-col-drag">{groupReorderMode ? 'Drag' : ''}</th>
                                    <th className="pm-col-id">ID</th>
                                    <th className="pm-col-name">Name</th>
                                    <th className="pm-col-order">Group Order</th>
                                    <th className="pm-col-actions">Action</th>
                                </tr>
                            </thead>
                            <Droppable droppableId="ATTRIBUTE_GROUPS" type="ATTRIBUTE_GROUP">
                                {(provided, snapshot) => (
                                    <tbody
                                        className={`pm-group-table-body ${snapshot.isDraggingOver ? 'is-drag-over' : ''}`}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {reorderedAttributeGroups.map((group, index) => (
                                            <Draggable
                                                key={group.id}
                                                draggableId={String(group.id)}
                                                index={index}
                                                isDragDisabled={!groupReorderMode || groupReorderSaving}
                                            >
                                                {(draggableProvided, draggableSnapshot) => (
                                                    <tr
                                                        ref={draggableProvided.innerRef}
                                                        {...draggableProvided.draggableProps}
                                                        {...draggableProvided.dragHandleProps}
                                                        className={draggableSnapshot.isDragging ? 'is-dragging' : ''}
                                                    >
                                                        <td className="pm-col-drag">{groupReorderMode ? <span className="pm-drag-handle">::::</span> : '-'}</td>
                                                        <td className="pm-col-id">{group.id}</td>
                                                        <td className="pm-col-name">{group.name}</td>
                                                        <td className="pm-col-order">{group.groupOrder}</td>
                                                        <td className="pm-col-actions">
                                                            <div className="pm-action-buttons">
                                                                <button type="button" className="pm-btn-action pm-btn-edit" onClick={() => openEditGroupModal(group)} disabled={groupReorderMode}>
                                                                    Update
                                                                </button>
                                                                <button type="button" className="pm-btn-action pm-btn-delete" onClick={() => handleDeleteGroup(group)} disabled={groupReorderMode}>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                )}
                            </Droppable>
                        </table>
                    </div>
                </DragDropContext>
            )}

            <AttributeGroupModal
                isOpen={groupModalOpen}
                isEditing={Boolean(editingGroupId)}
                form={groupForm}
                errors={groupErrors}
                loading={groupLoading}
                onClose={closeGroupModal}
                onNameChange={(event) => {
                    const { value } = event.target;
                    setGroupForm({ name: value });
                    if (groupErrors.name || groupErrors.general) {
                        setGroupErrors({});
                    }
                }}
                onSubmit={handleSaveGroup}
            />
        </>
    );
}

export default PMAttributeGroupView;




