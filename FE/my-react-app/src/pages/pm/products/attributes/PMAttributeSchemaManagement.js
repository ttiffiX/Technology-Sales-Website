import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../../api/ProductAPI';
import {
    addAttributeSchema,
    deleteAttributeSchema,
    getAttributeSchemasByCategory,
    updateAttributeSchema,
} from '../../../../api/PMAPI';
import { useToast } from '../../../../components/Toast/Toast';
import {
    EMPTY_ATTRIBUTE_SCHEMA_FORM,
    mapAttributeSchemaToForm,
    validateAttributeSchemaForm,
    buildAttributeSchemaPayload,
    getApiErrorMessage,
} from '../../../../utils';
import AttributeSchemaList from './AttributeSchemaList';
import AttributeSchemaModal from '../../../../components/modal/add_attribute/AttributeSchemaModal';
import './PMAttributeSchemaManagement.scss';

function PMAttributeSchemaManagement() {
    const navigate = useNavigate();
    const { triggerToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');

    const [attributes, setAttributes] = useState([]);
    const [loadingAttributes, setLoadingAttributes] = useState(false);

    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState(EMPTY_ATTRIBUTE_SCHEMA_FORM);
    const [addLoading, setAddLoading] = useState(false);

    const [editForm, setEditForm] = useState(EMPTY_ATTRIBUTE_SCHEMA_FORM);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const selectedCategoryId = useMemo(() => Number(categoryId), [categoryId]);

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
            setAttributes([]);
            return;
        }

        setLoadingAttributes(true);
        try {
            const data = await getAttributeSchemasByCategory(nextCategoryId);
            setAttributes(Array.isArray(data) ? data : []);
        } catch (_error) {
            setAttributes([]);
            triggerToast('error', 'Failed to load attribute schema list');
        } finally {
            setLoadingAttributes(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        setExpandedId(null);
        setEditingId(null);
        setAddOpen(false);
        setAddForm(EMPTY_ATTRIBUTE_SCHEMA_FORM);
        loadAttributes(selectedCategoryId);
    }, [selectedCategoryId]);

    const handleFormChange = (setter) => (event) => {
        const { name, value, type, checked } = event.target;
        setter((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleOpenEdit = (item) => {
        setEditingId(item.attributeId);
        setExpandedId(item.attributeId);
        setEditForm(mapAttributeSchemaToForm(item));
    };

    const handleCloseEdit = () => {
        setEditingId(null);
        setEditForm(EMPTY_ATTRIBUTE_SCHEMA_FORM);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        const errorText = validateAttributeSchemaForm(editForm);
        if (errorText) {
            triggerToast('error', errorText);
            return;
        }

        setEditLoading(true);
        try {
            const payload = buildAttributeSchemaPayload(editForm);
            const updated = await updateAttributeSchema(selectedCategoryId, payload);
            setAttributes((prev) =>
                prev.map((item) => (item.attributeId === editingId ? updated : item))
            );
            handleCloseEdit();
            triggerToast('success', 'Attribute schema updated successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to update attribute schema'));
        } finally {
            setEditLoading(false);
        }
    };

    const handleAddAttribute = async () => {
        if (!selectedCategoryId) {
            triggerToast('error', 'Please choose a category first');
            return;
        }

        const errorText = validateAttributeSchemaForm(addForm);
        if (errorText) {
            triggerToast('error', errorText);
            return;
        }

        setAddLoading(true);
        try {
            const payload = buildAttributeSchemaPayload(addForm);
            const created = await addAttributeSchema(selectedCategoryId, payload);
            setAttributes((prev) => [...prev, created]);
            setAddOpen(false);
            setAddForm(EMPTY_ATTRIBUTE_SCHEMA_FORM);
            triggerToast('success', 'Attribute schema added successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to add attribute schema'));
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteAttribute = async (attributeId) => {
        const confirmed = window.confirm('Delete this attribute schema?');
        if (!confirmed) return;

        setDeleteLoadingId(attributeId);
        try {
            await deleteAttributeSchema(attributeId);
            setAttributes((prev) => prev.filter((item) => item.attributeId !== attributeId));
            if (expandedId === attributeId) setExpandedId(null);
            if (editingId === attributeId) handleCloseEdit();
            triggerToast('success', 'Attribute schema deleted successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to delete attribute schema'));
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const toggleExpanded = (attributeId) => {
        setExpandedId((prev) => {
            const isClosingCurrent = prev === attributeId;
            if (isClosingCurrent && editingId === attributeId) {
                handleCloseEdit();
            }
            return isClosingCurrent ? null : attributeId;
        });
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
                        ← Back to Product Workspace
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

                    <button
                        className="pm-btn-add"
                        onClick={() => setAddOpen(true)}
                        disabled={!selectedCategoryId}
                    >
                        + Add Attribute
                    </button>
                </div>

                {!selectedCategoryId ? (
                    <div className="pm-attr-placeholder">Please choose category to view attributes.</div>
                ) : loadingAttributes ? (
                    <div className="pm-attr-placeholder">Loading attributes...</div>
                ) : (
                    <AttributeSchemaList
                        attributes={attributes}
                        expandedId={expandedId}
                        editingId={editingId}
                        editForm={editForm}
                        editLoading={editLoading}
                        onToggleExpanded={toggleExpanded}
                        onEdit={handleOpenEdit}
                        onEditChange={handleFormChange(setEditForm)}
                        onCancelEdit={handleCloseEdit}
                        onSaveEdit={handleSaveEdit}
                        onDelete={handleDeleteAttribute}
                        deleteLoadingId={deleteLoadingId}
                    />
                )}
            </div>

            <AttributeSchemaModal
                isOpen={addOpen}
                title="Add Attribute Schema"
                form={addForm}
                loading={addLoading}
                onChange={handleFormChange(setAddForm)}
                onClose={() => {
                    setAddOpen(false);
                    setAddForm(EMPTY_ATTRIBUTE_SCHEMA_FORM);
                }}
                onSubmit={handleAddAttribute}
            />

        </div>
    );
}

export default PMAttributeSchemaManagement;








