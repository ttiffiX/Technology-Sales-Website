import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../../../components/navigation/Nav';
import Header from '../../../components/header/Header';
import { getAllCategories } from '../../../api/ProductAPI';
import { addProduct, getAttributesByCategory } from '../../../api/PMAPI';
import { useToast } from '../../../components/Toast/Toast';
import { getAttributeInputVariant, groupAttributesByGroupName } from '../../../utils';
import './PMProductManagement.scss';

const INITIAL_FORM = {
    categoryId: '',
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    isActive: true,
};

function PMProductManagement() {
    const navigate = useNavigate();
    const { triggerToast } = useToast();
    const [categories, setCategories] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productForm, setProductForm] = useState(INITIAL_FORM);
    const [attributes, setAttributes] = useState([]);
    const [attributeValues, setAttributeValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [loadingAttr, setLoadingAttr] = useState(false);
    const [errorAttr, setErrorAttr] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);

    useEffect(() => {
        getAllCategories()
            .then(setCategories)
            .catch(() => {
                triggerToast('error', 'Failed to load categories');
            });
    }, [triggerToast]);

    useEffect(() => {
        if (!isAddModalOpen || !productForm.categoryId) {
            setAttributes([]);
            setLoadingAttr(false);
            setErrorAttr(null);
            return;
        }

        let isMounted = true;

        setLoadingAttr(true);
        setErrorAttr(null);

        getAttributesByCategory(productForm.categoryId)
            .then((data) => {
                if (!isMounted) return;
                setAttributes(data);
            })
            .catch(() => {
                if (!isMounted) return;
                setAttributes([]);
                setErrorAttr('Failed to load category attributes');
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingAttr(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isAddModalOpen, productForm.categoryId]);

    const groupedAttributes = useMemo(() => groupAttributesByGroupName(attributes), [attributes]);

    const resetAddModal = () => {
        setProductForm(INITIAL_FORM);
        setAttributes([]);
        setAttributeValues({});
        setFormErrors({});
        setLoadingAttr(false);
        setErrorAttr(null);
        setSavingProduct(false);
    };

    const openAddModal = () => {
        resetAddModal();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        resetAddModal();
    };

    const handleBaseFieldChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;

        setProductForm((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleCategoryChange = (event) => {
        const nextCategoryId = event.target.value;

        setProductForm((prev) => ({
            ...prev,
            categoryId: nextCategoryId,
        }));

        setAttributes([]);
        setAttributeValues({});
        setErrorAttr(null);

        if (formErrors.categoryId) {
            setFormErrors((prev) => ({
                ...prev,
                categoryId: '',
            }));
        }
    };

    const handleAttributeChange = (attributeCode, value) => {
        setAttributeValues((prev) => ({
            ...prev,
            [attributeCode]: value,
        }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!productForm.categoryId) {
            nextErrors.categoryId = 'Please choose a category';
        }

        if (!productForm.title.trim()) {
            nextErrors.title = 'Title is required';
        }

        if (productForm.price === '') {
            nextErrors.price = 'Price is required';
        } else if (Number.isNaN(Number(productForm.price)) || Number(productForm.price) < 0) {
            nextErrors.price = 'Price must be a valid number >= 0';
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleAddProduct = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSavingProduct(true);

        try {
            await addProduct(
                {
                    ...productForm,
                    attributes: attributeValues,
                },
                attributes
            );

            triggerToast('success', 'Product added successfully');
            closeAddModal();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'Failed to add product';

            triggerToast('error', message);
        } finally {
            setSavingProduct(false);
        }
    };

    const renderAttributeInput = (attribute) => {
        const inputVariant = getAttributeInputVariant(attribute.dataType);
        const value = attributeValues[attribute.code] ?? '';
        const labelText = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ''}`;

        if (inputVariant === 'boolean') {
            return (
                <div className="pm-form-group" key={attribute.attributeId}>
                    <label htmlFor={`attr-${attribute.code}`}>{labelText}</label>
                    <select
                        id={`attr-${attribute.code}`}
                        value={value}
                        onChange={(event) => handleAttributeChange(attribute.code, event.target.value)}
                        disabled={savingProduct}
                    >
                        <option value="">-- Select --</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
            );
        }

        if (inputVariant === 'list') {
            return (
                <div className="pm-form-group" key={attribute.attributeId}>
                    <label htmlFor={`attr-${attribute.code}`}>{labelText}</label>
                    <input
                        id={`attr-${attribute.code}`}
                        type="text"
                        value={value}
                        onChange={(event) => handleAttributeChange(attribute.code, event.target.value)}
                        placeholder="Enter values separated by commas"
                        disabled={savingProduct}
                    />
                </div>
            );
        }

        return (
            <div className="pm-form-group" key={attribute.attributeId}>
                <label htmlFor={`attr-${attribute.code}`}>{labelText}</label>
                <input
                    id={`attr-${attribute.code}`}
                    type={inputVariant === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(event) => handleAttributeChange(attribute.code, event.target.value)}
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    step={inputVariant === 'number' ? 'any' : undefined}
                    disabled={savingProduct}
                />
            </div>
        );
    };

    return (
        <div className="pm-page">
            <Nav count={0} />
            <Header title="Product Management" modeDisplay="default" />

            <div className="pm-content">
                <div className="pm-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm')}>
                        ← Dashboard
                    </button>

                    <button className="pm-btn-add" onClick={openAddModal}>
                        + Add Product
                    </button>
                </div>

                <div className="pm-product-list-placeholder">
                    <p>Product list will appear here.</p>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="pm-add-modal-overlay" onClick={closeAddModal}>
                    <div className="pm-add-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="pm-add-modal__header">
                            <div>
                                <h2>Add Product</h2>
                                <p>Select a category first, then fill in the required product information.</p>
                            </div>
                            <button type="button" className="pm-add-modal__close" onClick={closeAddModal}>
                                ×
                            </button>
                        </div>

                        <form className="pm-add-form" onSubmit={handleAddProduct}>
                            <div className="pm-form-group pm-form-group--full">
                                <label htmlFor="pm-product-category">
                                    Category <span>*</span>
                                </label>
                                <select
                                    id="pm-product-category"
                                    name="categoryId"
                                    value={productForm.categoryId}
                                    onChange={handleCategoryChange}
                                    disabled={savingProduct}
                                >
                                    <option value="">-- Select category --</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.categoryId && <span className="pm-form-error">{formErrors.categoryId}</span>}
                            </div>

                            {!productForm.categoryId && (
                                <div className="pm-add-form__hint">
                                    Choose a category to load the correct fields for this product.
                                </div>
                            )}

                            {productForm.categoryId && loadingAttr && (
                                <div className="pm-add-form__status">Loading category attributes…</div>
                            )}

                            {productForm.categoryId && errorAttr && (
                                <div className="pm-add-form__status pm-add-form__status--error">{errorAttr}</div>
                            )}

                            {productForm.categoryId && !loadingAttr && !errorAttr && (
                                <>
                                    <div className="pm-add-form__grid">
                                        <div className="pm-form-group pm-form-group--full">
                                            <label htmlFor="pm-product-title">
                                                Product title <span>*</span>
                                            </label>
                                            <input
                                                id="pm-product-title"
                                                name="title"
                                                type="text"
                                                value={productForm.title}
                                                onChange={handleBaseFieldChange}
                                                placeholder="Enter product title"
                                                disabled={savingProduct}
                                            />
                                            {formErrors.title && <span className="pm-form-error">{formErrors.title}</span>}
                                        </div>

                                        <div className="pm-form-group">
                                            <label htmlFor="pm-product-price">
                                                Price <span>*</span>
                                            </label>
                                            <input
                                                id="pm-product-price"
                                                name="price"
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={productForm.price}
                                                onChange={handleBaseFieldChange}
                                                placeholder="Enter price"
                                                disabled={savingProduct}
                                            />
                                            {formErrors.price && <span className="pm-form-error">{formErrors.price}</span>}
                                        </div>

                                        <div className="pm-form-group pm-form-group--checkbox">
                                            <label htmlFor="pm-product-active">Active for sale</label>
                                            <input
                                                id="pm-product-active"
                                                name="isActive"
                                                type="checkbox"
                                                checked={productForm.isActive}
                                                onChange={handleBaseFieldChange}
                                                disabled={savingProduct}
                                            />
                                        </div>

                                        <div className="pm-form-group pm-form-group--full">
                                            <label htmlFor="pm-product-image">Image URL</label>
                                            <input
                                                id="pm-product-image"
                                                name="imageUrl"
                                                type="text"
                                                value={productForm.imageUrl}
                                                onChange={handleBaseFieldChange}
                                                placeholder="Enter image URL"
                                                disabled={savingProduct}
                                            />
                                        </div>

                                        <div className="pm-form-group pm-form-group--full">
                                            <label htmlFor="pm-product-description">Description</label>
                                            <textarea
                                                id="pm-product-description"
                                                name="description"
                                                value={productForm.description}
                                                onChange={handleBaseFieldChange}
                                                placeholder="Enter product description"
                                                rows={4}
                                                disabled={savingProduct}
                                            />
                                        </div>
                                    </div>

                                    {groupedAttributes.length > 0 && (
                                        <div className="pm-attribute-sections">
                                            {groupedAttributes.map((group) => (
                                                <section className="pm-attribute-section" key={group.groupName}>
                                                    <h3>{group.groupName}</h3>
                                                    <div className="pm-add-form__grid">
                                                        {group.items.map(renderAttributeInput)}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    )}

                                    {groupedAttributes.length === 0 && (
                                        <div className="pm-add-form__hint pm-add-form__hint--soft">
                                            This category has no extra attributes. You can still create the product with the basic information above.
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="pm-add-modal__actions">
                                <button type="button" className="pm-btn-cancel" onClick={closeAddModal} disabled={savingProduct}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="pm-btn-submit"
                                    disabled={savingProduct || loadingAttr || !!errorAttr || !productForm.categoryId}
                                >
                                    {savingProduct ? 'Adding...' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PMProductManagement;




