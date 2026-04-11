import React from 'react';
import AttributeSchemaFormFields from './AttributeSchemaFormFields';

function AttributeSchemaModal({
    isOpen,
    title,
    form,
    errors = {},
    loading,
    isCodeLocked = false,
    onChange,
    onClose,
    onSubmit,
    attributeGroups = [],
}) {
    if (!isOpen) return null;

    const showGroupSelect = true;

    return (
        <div className="pm-attr-modal-overlay" onClick={onClose}>
            <div className="pm-attr-modal" onClick={(event) => event.stopPropagation()}>
                <div className="pm-attr-modal__header">
                    <h3>{title}</h3>
                    <button type="button" className="pm-attr-modal__close" onClick={onClose} aria-label="Close">
                        x
                    </button>
                </div>

                <AttributeSchemaFormFields
                    form={form}
                    errors={errors}
                    onChange={onChange}
                    isCodeLocked={isCodeLocked}
                    attributeGroups={attributeGroups}
                    showGroupSelect={showGroupSelect}
                />

                {errors.general && <p className="pm-form-general-error">{errors.general}</p>}

                <div className="pm-attr-modal__actions">
                    <button
                        type="button"
                        className="pm-action-btn pm-action-btn--cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="pm-action-btn pm-action-btn--save"
                        onClick={onSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AttributeSchemaModal;

