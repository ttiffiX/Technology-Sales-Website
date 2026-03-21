import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from '../../../components/navigation/Nav';
import Header from '../../../components/header/Header';
import { getAttributesByCategory, getPMProductDetail, updatePMProduct } from '../../../api/PMAPI';
import { useToast } from '../../../components/Toast/Toast';
import {
    buildPMDetailAttributeValues,
    formatPrice,
    formatProductAttributeValue,
    getAttributeInputVariant,
    getImage,
    groupAttributesByGroupName,
} from '../../../utils';
import './PMProductDetail.scss';

const INITIAL_FORM = {
    categoryId: '',
    title: '',
    description: '',
    price: '',
    quantity: '',
    quantitySold: '',
    imageUrl: '',
    isActive: true,
};

function PMProductDetail() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { triggerToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [product, setProduct] = useState(null);
    const [attributeSchemas, setAttributeSchemas] = useState([]);
    const [attributeValues, setAttributeValues] = useState({});
    const [form, setForm] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});

    const groupedAttributeSchemas = useMemo(
        () => groupAttributesByGroupName(attributeSchemas),
        [attributeSchemas]
    );

    const fillFormFromProduct = (detail) => {
        setForm({
            categoryId: detail?.categoryId ?? '',
            title: detail?.title ?? '',
            description: detail?.description ?? '',
            price: detail?.price ?? '',
            quantity: detail?.quantity ?? '',
            quantitySold: detail?.quantitySold ?? '',
            imageUrl: detail?.imageUrl ?? '',
            isActive: detail?.isActive !== false,
        });
    };

    const loadProductDetail = async () => {
        setLoading(true);
        setError(null);

        try {
            const detail = await getPMProductDetail(productId);
            let schemas = [];

            if (detail?.categoryId) {
                schemas = await getAttributesByCategory(detail.categoryId);
            }

            setProduct(detail);
            fillFormFromProduct(detail);
            setAttributeSchemas(schemas);
            setAttributeValues(buildPMDetailAttributeValues(detail.attributes || {}, schemas));
        } catch (_error) {
            setError('Failed to load product detail');
            setProduct(null);
            setAttributeSchemas([]);
            setAttributeValues({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProductDetail();
    }, [productId]);

    const validateForm = () => {
        const nextErrors = {};

        if (!form.title.trim()) {
            nextErrors.title = 'Title is required';
        }

        if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
            nextErrors.price = 'Price must be a valid number >= 0';
        }

        if (form.quantity === '' || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
            nextErrors.quantity = 'Quantity must be a valid number >= 0';
        }

        if (
            form.quantitySold !== '' &&
            (Number.isNaN(Number(form.quantitySold)) || Number(form.quantitySold) < 0)
        ) {
            nextErrors.quantitySold = 'Quantity sold must be a valid number >= 0';
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleFieldChange = (event) => {
        const { name, type, value, checked } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleStartEdit = () => {
        if (!product) return;
        fillFormFromProduct(product);
        setAttributeValues(buildPMDetailAttributeValues(product.attributes || {}, attributeSchemas));
        setFormErrors({});
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (!product) return;
        fillFormFromProduct(product);
        setAttributeValues(buildPMDetailAttributeValues(product.attributes || {}, attributeSchemas));
        setFormErrors({});
        setIsEditing(false);
    };

    const handleAttributeChange = (attributeCode, value) => {
        setAttributeValues((prev) => ({
            ...prev,
            [attributeCode]: value,
        }));
    };

    const handleListAttributeItemChange = (attributeCode, index, value) => {
        setAttributeValues((prev) => {
            const previousValue = prev[attributeCode];
            const listValues = Array.isArray(previousValue) ? [...previousValue] : [''];

            if (index >= listValues.length) {
                listValues.push('');
            }

            listValues[index] = value;

            return {
                ...prev,
                [attributeCode]: listValues,
            };
        });
    };

    const addListAttributeItem = (attributeCode) => {
        setAttributeValues((prev) => {
            const previousValue = prev[attributeCode];
            const listValues = Array.isArray(previousValue) ? [...previousValue] : [''];

            return {
                ...prev,
                [attributeCode]: [...listValues, ''],
            };
        });
    };

    const removeListAttributeItem = (attributeCode, index) => {
        setAttributeValues((prev) => {
            const previousValue = prev[attributeCode];
            const listValues = Array.isArray(previousValue) ? [...previousValue] : [''];

            if (listValues.length <= 1) {
                return {
                    ...prev,
                    [attributeCode]: [''],
                };
            }

            listValues.splice(index, 1);

            return {
                ...prev,
                [attributeCode]: listValues,
            };
        });
    };

    const renderAttributeInput = (attribute) => {
        const inputVariant = getAttributeInputVariant(attribute.dataType);
        const value = attributeValues[attribute.code] ?? (inputVariant === 'list' ? [''] : '');
        const labelText = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ''}`;

        if (inputVariant === 'boolean') {
            return (
                <div className="pm-field pm-field--attribute" key={attribute.attributeId}>
                    <label htmlFor={`pm-detail-attr-${attribute.code}`}>{labelText}</label>
                    <select
                        id={`pm-detail-attr-${attribute.code}`}
                        value={value}
                        onChange={(event) => handleAttributeChange(attribute.code, event.target.value)}
                        disabled={saving}
                    >
                        <option value="">-- Select --</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
            );
        }

        if (inputVariant === 'list') {
            const listValues = Array.isArray(value) ? value : [value || ''];

            return (
                <div className="pm-field pm-field--attribute pm-field--full" key={attribute.attributeId}>
                    <label>{labelText}</label>
                    <div className="pm-detail-list-inputs">
                        {listValues.map((itemValue, index) => {
                            const inputId = `pm-detail-attr-${attribute.code}-${index}`;
                            const isLastInput = index === listValues.length - 1;

                            return (
                                <div className="pm-detail-list-row" key={inputId}>
                                    <input
                                        id={inputId}
                                        type="text"
                                        value={itemValue}
                                        onChange={(event) => handleListAttributeItemChange(attribute.code, index, event.target.value)}
                                        placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                        disabled={saving}
                                    />
                                    <button
                                        type="button"
                                        className="pm-detail-list-btn pm-detail-list-btn--add"
                                        onClick={() => addListAttributeItem(attribute.code)}
                                        disabled={saving || !isLastInput}
                                    >
                                        +
                                    </button>
                                    {listValues.length > 1 && (
                                        <button
                                            type="button"
                                            className="pm-detail-list-btn pm-detail-list-btn--remove"
                                            onClick={() => removeListAttributeItem(attribute.code, index)}
                                            disabled={saving}
                                        >
                                            -
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className="pm-field pm-field--attribute" key={attribute.attributeId}>
                <label htmlFor={`pm-detail-attr-${attribute.code}`}>{labelText}</label>
                <input
                    id={`pm-detail-attr-${attribute.code}`}
                    type={inputVariant === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(event) => handleAttributeChange(attribute.code, event.target.value)}
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    step={inputVariant === 'number' ? 'any' : undefined}
                    disabled={saving}
                />
            </div>
        );
    };

    const handleSave = async () => {
        if (!product) return;
        if (!validateForm()) return;

        setSaving(true);
        try {
            await updatePMProduct(product.id, form, attributeSchemas, product.attributes || {}, attributeValues);
            triggerToast('success', 'Product updated successfully');
            setIsEditing(false);
            await loadProductDetail();
        } catch (errorResponse) {
            const message =
                errorResponse?.response?.data?.message ||
                errorResponse?.response?.data ||
                'Failed to update product';
            triggerToast('error', message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="pm-product-detail-page">
            <Nav count={0} />
            <Header title="Product Detail" modeDisplay="default" />

            <div className="pm-product-detail-content">
                <div className="pm-product-detail-toolbar">
                    <button type="button" className="pm-btn-back" onClick={() => navigate('/pm/products/list')}>
                        ← Product list
                    </button>
                </div>

                {loading && <div className="pm-product-detail-state">Loading product detail...</div>}
                {!loading && error && <div className="pm-product-detail-state pm-product-detail-state--error">{error}</div>}

                {!loading && !error && product && (
                    <div className="pm-product-detail-card">
                        <div className="pm-product-detail-main">
                            <div className="pm-product-media">
                                <div className="pm-product-image" style={{ backgroundImage: `url(${getImage(product.imageUrl)})` }} />
                            </div>

                            <div className="pm-product-detail-grid">
                                <div className="pm-field pm-field--full pm-field--category">
                                    <span className="pm-category-tag pm-category-tag--inline">
                                        {product.categoryName || 'Uncategorized'}
                                    </span>
                                </div>

                                <div className="pm-field pm-field--full pm-field--title-card">
                                    <label htmlFor="pm-detail-title">Title</label>
                                    {isEditing ? (
                                        <input id="pm-detail-title" name="title" value={form.title} onChange={handleFieldChange} />
                                    ) : (
                                        <div className="pm-title-value">{product.title || '-'}</div>
                                    )}
                                    {formErrors.title && <span className="pm-form-error">{formErrors.title}</span>}
                                </div>

                                <div className="pm-field pm-field--stat">
                                    <label htmlFor="pm-detail-price">Price</label>
                                    {isEditing ? (
                                        <input
                                            id="pm-detail-price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.price}
                                            onChange={handleFieldChange}
                                        />
                                    ) : (
                                        <div className="pm-price-value">{formatPrice(product.price)}</div>
                                    )}
                                    {formErrors.price && <span className="pm-form-error">{formErrors.price}</span>}
                                </div>

                                <div className="pm-field pm-field--stat">
                                    <label htmlFor="pm-detail-quantity">Quantity</label>
                                    {isEditing ? (
                                        <input
                                            id="pm-detail-quantity"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.quantity}
                                            onChange={handleFieldChange}
                                        />
                                    ) : (
                                        <div className="pm-stat-value">{product.quantity ?? '-'}</div>
                                    )}
                                    {formErrors.quantity && <span className="pm-form-error">{formErrors.quantity}</span>}
                                </div>

                                <div className="pm-field pm-field--stat">
                                    <label>Active</label>
                                    {isEditing ? (
                                        <label className="pm-detail-switch" htmlFor="pm-detail-active">
                                            <input
                                                id="pm-detail-active"
                                                name="isActive"
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={handleFieldChange}
                                                className="pm-detail-switch__input"
                                            />
                                            <span className="pm-detail-switch__slider" />
                                            <span className="pm-detail-switch__text">{form.isActive ? 'On' : 'Off'}</span>
                                        </label>
                                    ) : (
                                        <div className={`pm-stat-badge ${product.isActive ? 'pm-stat-badge--active' : 'pm-stat-badge--inactive'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    )}
                                </div>

                                <div className="pm-field pm-field--stat">
                                    <label htmlFor="pm-detail-quantity-sold">Quantity sold</label>
                                    {isEditing ? (
                                        <input
                                            id="pm-detail-quantity-sold"
                                            name="quantitySold"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.quantitySold}
                                            onChange={handleFieldChange}
                                        />
                                    ) : (
                                        <div className="pm-stat-value">{product.quantitySold ?? 0}</div>
                                    )}
                                    {formErrors.quantitySold && <span className="pm-form-error">{formErrors.quantitySold}</span>}
                                </div>

                                <div className="pm-field pm-field--full pm-description-panel">
                                    <label htmlFor="pm-detail-description">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            id="pm-detail-description"
                                            name="description"
                                            rows={4}
                                            value={form.description}
                                            onChange={handleFieldChange}
                                        />
                                    ) : (
                                        <div className="pm-description-value">{product.description || '-'}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pm-attribute-block">
                            <h3>Attributes</h3>
                            {isEditing ? (
                                groupedAttributeSchemas.length === 0 ? (
                                    <p>No attributes</p>
                                ) : (
                                    <div className="pm-attribute-editor">
                                        {groupedAttributeSchemas.map((group) => (
                                            <section className="pm-attribute-edit-group" key={group.groupName}>
                                                <h4 className="pm-spec-group-name">{group.groupName}</h4>
                                                <div className="pm-attribute-edit-grid">
                                                    {group.items.map(renderAttributeInput)}
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                )
                            ) : (!product.attributes || Object.keys(product.attributes).length === 0 ? (
                                <p>No attributes</p>
                            ) : (
                                <div className="pm-attribute-groups">
                                    {Object.entries(product.attributes).map(([groupOrder, group]) => (
                                        <div className="pm-spec-group" key={groupOrder}>
                                            <h4 className="pm-spec-group-name">{group.groupName}</h4>
                                            <table className="pm-specs-table">
                                                <tbody>
                                                    {(group.filterAttributes || []).map((attr, index) => (
                                                        <tr key={`${groupOrder}-${index}`}>
                                                            <td className="pm-spec-label">{attr.attributeName}</td>
                                                            <td className="pm-spec-value">
                                                                {formatProductAttributeValue(attr.availableValues)}
                                                                {attr.unit ? ` ${attr.unit}` : ''}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="pm-product-detail-footer">
                            {!isEditing ? (
                                <button type="button" className="pm-btn-edit" onClick={handleStartEdit} disabled={loading || !!error}>
                                    Update
                                </button>
                            ) : (
                                <div className="pm-product-detail-footer__actions">
                                    <button type="button" className="pm-btn-cancel" onClick={handleCancelEdit} disabled={saving}>
                                        Cancel
                                    </button>
                                    <button type="button" className="pm-btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PMProductDetail;

