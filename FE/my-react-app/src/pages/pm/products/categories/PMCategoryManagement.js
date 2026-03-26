import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../../api/ProductAPI';
import { addCategory, deleteCategory, updateCategory } from '../../../../api/PMAPI';
import { useToast } from '../../../../components/Toast/Toast';
import { getApiErrorMessage } from '../../../../utils';
import './PMCategoryManagement.scss';

function PMCategoryManagement() {
    const navigate = useNavigate();
    const { triggerToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const [savingAdd, setSavingAdd] = useState(false);
    const [savingEditId, setSavingEditId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (_error) {
            setCategories([]);
            triggerToast('error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleStartEdit = (category) => {
        setEditingCategoryId(category.id);
        setEditingName(category.name || '');
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setEditingName('');
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();
        const trimmedName = newCategoryName.trim();

        if (!trimmedName) {
            triggerToast('error', 'Category name is required');
            return;
        }

        setSavingAdd(true);
        try {
            const created = await addCategory(trimmedName);
            if (created?.id) {
                setCategories((prev) => [...prev, created]);
            } else {
                await loadCategories();
            }

            setNewCategoryName('');
            setIsAddOpen(false);
            triggerToast('success', 'Category added successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to add category'));
        } finally {
            setSavingAdd(false);
        }
    };

    const handleUpdateCategory = async (categoryId) => {
        const trimmedName = editingName.trim();

        if (!trimmedName) {
            triggerToast('error', 'Category name is required');
            return;
        }

        setSavingEditId(categoryId);
        try {
            const updated = await updateCategory(categoryId, trimmedName);
            setCategories((prev) => prev.map((item) => (item.id === categoryId ? updated : item)));
            handleCancelEdit();
            triggerToast('success', 'Category updated successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to update category'));
        } finally {
            setSavingEditId(null);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        const confirmed = window.confirm('Delete this category?');
        if (!confirmed) {
            return;
        }

        setDeletingId(categoryId);
        try {
            await deleteCategory(categoryId);
            setCategories((prev) => prev.filter((item) => item.id !== categoryId));
            if (editingCategoryId === categoryId) {
                handleCancelEdit();
            }
            triggerToast('success', 'Category deleted successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to delete category'));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="pm-category-page">
            <div className="pm-category-header">
                <h2>Categories</h2>
                <p>Manage product categories</p>
            </div>

            <div className="pm-category-content">
                <div className="pm-category-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm/products')}>
                        ← Back to Product Workspace
                    </button>
                    <button className="pm-btn-add" onClick={() => setIsAddOpen((prev) => !prev)}>
                        {isAddOpen ? 'Close Add Form' : '+ Add Category'}
                    </button>
                </div>

                {isAddOpen && (
                    <form className="pm-category-add-card" onSubmit={handleAddCategory}>
                        <h3>Add New Category</h3>
                        <div className="pm-category-add-row">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(event) => setNewCategoryName(event.target.value)}
                                placeholder="Enter category name"
                                maxLength={100}
                                disabled={savingAdd}
                            />
                            <button type="submit" disabled={savingAdd}>
                                {savingAdd ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="pm-category-placeholder">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="pm-category-placeholder">No categories found.</div>
                ) : (
                    <div className="pm-category-table-wrapper">
                        <table className="pm-category-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => {
                                    const isEditing = editingCategoryId === category.id;
                                    return (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className="pm-category-edit-input"
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(event) => setEditingName(event.target.value)}
                                                        maxLength={100}
                                                    />
                                                ) : (
                                                    category.name
                                                )}
                                            </td>
                                            <td className="pm-category-actions">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            className="pm-action-btn pm-action-btn--save"
                                                            onClick={() => handleUpdateCategory(category.id)}
                                                            disabled={savingEditId === category.id}
                                                        >
                                                            {savingEditId === category.id ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            className="pm-action-btn pm-action-btn--cancel"
                                                            onClick={handleCancelEdit}
                                                            disabled={savingEditId === category.id}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="pm-action-btn pm-action-btn--edit"
                                                            onClick={() => handleStartEdit(category)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="pm-action-btn pm-action-btn--delete"
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                            disabled={deletingId === category.id}
                                                        >
                                                            {deletingId === category.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PMCategoryManagement;

