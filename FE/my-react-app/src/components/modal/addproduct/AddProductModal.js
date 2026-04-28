import * as React from 'react';
import { getAttributeInputVariant, groupAttributesByGroupName } from '../../../utils';

function AddProductModal({
    isOpen,
    onClose,
    onSubmit,
    savingProduct,
    categories,
    productForm,
    formErrors,
    loadingAttr,
    errorAttr,
    attributes,
    attributeValues,
    onCategoryChange,
    onBaseFieldChange,
    onAttributeChange,
    onListAttributeItemChange,
    onAddListAttributeItem,
    onRemoveListAttributeItem,
    onFileChange,
}) {
    const { useMemo, useState, useEffect } = React;
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileError, setFileError] = useState('');
    const groupedAttributes = useMemo(() => groupAttributesByGroupName(attributes), [attributes]);

    useEffect(() => {
        // create object URL for File instances, or use provided string URL
        const file = productForm?.imageFile;
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        if (typeof file === 'string') {
            setPreviewUrl(file);
            return;
        }

        // file is a File object
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
            setPreviewUrl(null);
        };
    }, [productForm?.imageFile]);

    if (!isOpen) {
        return null;
    }

    const renderAttributeInput = (attribute) => {
        const inputVariant = getAttributeInputVariant(attribute.dataType);
        const value = attributeValues[attribute.code] ?? (inputVariant === 'list' ? [''] : '');
        const labelText = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ''}`;

        if (inputVariant === 'boolean') {
            return (
                <div className="pm-form-group" key={attribute.attributeId}>
                    <label htmlFor={`attr-${attribute.code}`}>{labelText}</label>
                    <select
                        id={`attr-${attribute.code}`}
                        value={value}
                        onChange={(event) => onAttributeChange(attribute.code, event.target.value)}
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
            const listValues = Array.isArray(value) ? value : [value || ''];

            return (
                <div className="pm-form-group" key={attribute.attributeId}>
                    <label>{labelText}</label>
                    <div className="pm-list-inputs">
                        {listValues.map((itemValue, index) => {
                            const inputId = `attr-${attribute.code}-${index}`;
                            const isLastInput = index === listValues.length - 1;

                            return (
                                <div className="pm-list-input-row" key={inputId}>
                                    <input
                                        id={inputId}
                                        type="text"
                                        value={itemValue}
                                        onChange={(event) => onListAttributeItemChange(attribute.code, index, event.target.value)}
                                        placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                        disabled={savingProduct}
                                    />
                                    <button
                                        type="button"
                                        className="pm-list-btn pm-list-btn--add"
                                        onClick={() => onAddListAttributeItem(attribute.code)}
                                        disabled={savingProduct || !isLastInput}
                                        aria-label={`Add ${attribute.name}`}
                                    >
                                        +
                                    </button>
                                    {listValues.length > 1 && (
                                        <button
                                            type="button"
                                            className="pm-list-btn pm-list-btn--remove"
                                            onClick={() => onRemoveListAttributeItem(attribute.code, index)}
                                            disabled={savingProduct}
                                            aria-label={`Remove ${attribute.name}`}
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
            <div className="pm-form-group" key={attribute.attributeId}>
                <label htmlFor={`attr-${attribute.code}`}>{labelText}</label>
                <input
                    id={`attr-${attribute.code}`}
                    type={inputVariant === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(event) => onAttributeChange(attribute.code, event.target.value)}
                    placeholder={`Enter ${attribute.name.toLowerCase()}`}
                    step={inputVariant === 'number' ? 'any' : undefined}
                    disabled={savingProduct}
                />
            </div>
        );
    };

    return (
        <div className="pm-add-modal-overlay" onClick={onClose}>
            <div className="pm-add-modal" onClick={(event) => event.stopPropagation()}>
                <div className="pm-add-modal__header">
                    <div>
                        <h2>Add Product</h2>
                        <p>Select a category first, then fill in the required product information.</p>
                    </div>
                    <button type="button" className="pm-add-modal__close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form className="pm-add-form" onSubmit={onSubmit}>
                    <div className="pm-add-form__section">
                        <div className="pm-add-form__section-title">Category</div>
                        <div className="pm-form-group pm-form-group--full">
                            <label htmlFor="pm-product-category">
                                Category <span>*</span>
                            </label>
                            <select
                                id="pm-product-category"
                                name="categoryId"
                                value={productForm.categoryId}
                                onChange={onCategoryChange}
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
                    </div>

                    {!productForm.categoryId && (
                        <div className="pm-add-form__hint">
                            Choose a category to load the correct fields for this product.
                        </div>
                    )}

                    {productForm.categoryId && loadingAttr && (
                        <div className="pm-add-form__status">Loading category attributes...</div>
                    )}

                    {productForm.categoryId && errorAttr && (
                        <div className="pm-add-form__status pm-add-form__status--error">{errorAttr}</div>
                    )}

                    {productForm.categoryId && !loadingAttr && !errorAttr && (
                        <>
                            <div className="pm-add-form__section">
                                <div className="pm-add-form__section-title">Basic Information</div>
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
                                            onChange={onBaseFieldChange}
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
                                            onChange={onBaseFieldChange}
                                            placeholder="Enter price"
                                            disabled={savingProduct}
                                        />
                                        {formErrors.price && <span className="pm-form-error">{formErrors.price}</span>}
                                    </div>

                                    <div className="pm-form-group">
                                        <label htmlFor="pm-product-quantity">
                                            Quantity <span>*</span>
                                        </label>
                                        <input
                                            id="pm-product-quantity"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={productForm.quantity}
                                            onChange={onBaseFieldChange}
                                            placeholder="Enter quantity"
                                            disabled={savingProduct}
                                        />
                                        {formErrors.quantity && <span className="pm-form-error">{formErrors.quantity}</span>}
                                    </div>

                                    <div className="pm-form-group">
                                        <label htmlFor="pm-product-quantity-sold">Quantity sold</label>
                                        <input
                                            id="pm-product-quantity-sold"
                                            name="quantitySold"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={productForm.quantitySold}
                                            onChange={onBaseFieldChange}
                                            placeholder="Enter quantity sold"
                                            disabled={savingProduct}
                                        />
                                        {formErrors.quantitySold && (
                                            <span className="pm-form-error">{formErrors.quantitySold}</span>
                                        )}
                                    </div>

                                    <div className="pm-form-group pm-form-group--toggle">
                                        <label htmlFor="pm-product-active">Active for sale</label>
                                        <label className="pm-switch" htmlFor="pm-product-active">
                                            <input
                                                id="pm-product-active"
                                                name="isActive"
                                                type="checkbox"
                                                checked={productForm.isActive}
                                                onChange={onBaseFieldChange}
                                                disabled={savingProduct}
                                                className="pm-switch__input"
                                            />
                                            <span className="pm-switch__slider" />
                                            <span className="pm-switch__text">{productForm.isActive ? 'On' : 'Off'}</span>
                                        </label>
                                    </div>


                                    <div className="pm-form-group pm-form-group--full">
                                        <label htmlFor="pm-product-image-file">Upload image</label>
                                                <input
                                                    id="pm-product-image-file"
                                                    name="imageFile"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files && e.target.files[0];
                                                        if (!file) {
                                                            setFileError('');
                                                            onFileChange && onFileChange(null);
                                                            return;
                                                        }

                                                        const maxBytes = 5 * 1024 * 1024; // 5MB
                                                        if (file.size > maxBytes) {
                                                            setFileError('Image must be smaller than 5MB');
                                                            onFileChange && onFileChange(null);
                                                            return;
                                                        }

                                                        setFileError('');
                                                        onFileChange && onFileChange(file);
                                                    }}
                                                    disabled={savingProduct}
                                                />

                                                <div className="pm-form-hint">Maximum file size: 5MB. Accepted: image/*</div>

                                                {fileError ? <div className="pm-form-error">{fileError}</div> : null}

                                                {productForm.imageFile && (
                                                    <div className="pm-image-preview">
                                                        {previewUrl ? (
                                                            <img
                                                                src={previewUrl}
                                                                alt="preview"
                                                                style={{ maxWidth: '160px', maxHeight: '120px', objectFit: 'cover', display: 'block' }}
                                                            />
                                                        ) : null}
                                                        <div className="pm-image-meta">
                                                            <div className="pm-image-name">
                                                                {typeof productForm.imageFile === 'string'
                                                                    ? productForm.imageFile
                                                                    : productForm.imageFile.name}
                                                            </div>
                                                            {typeof productForm.imageFile !== 'string' && (
                                                                <div className="pm-image-size">{(productForm.imageFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                    </div>

                                    <div className="pm-form-group pm-form-group--full">
                                        <label htmlFor="pm-product-description">Description</label>
                                        <textarea
                                            id="pm-product-description"
                                            name="description"
                                            value={productForm.description}
                                            onChange={onBaseFieldChange}
                                            placeholder="Enter product description"
                                            rows={4}
                                            disabled={savingProduct}
                                        />
                                    </div>
                                </div>
                            </div>

                            {groupedAttributes.length > 0 && (
                                <div className="pm-attribute-sections">
                                    <div className="pm-add-form__section-title">Category Attributes</div>
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
                        <button type="button" className="pm-btn-cancel" onClick={onClose} disabled={savingProduct}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="pm-btn-submit"
                            disabled={savingProduct || loadingAttr || !!errorAttr || !!fileError || !productForm.categoryId}
                        >
                            {savingProduct ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductModal;


