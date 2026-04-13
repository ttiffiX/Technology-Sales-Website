import React from 'react';

function AttributeGroupModal({
                                 isOpen,
                                 isEditing,
                                 form,
                                 errors = {},
                                 loading,
                                 onClose,
                                 onNameChange,
                                 onSubmit,
                             }) {
    if (!isOpen) return null;

    return (
        <div className="pm-attr-modal-overlay" onClick={onClose}>
            <div className="pm-attr-modal pm-group-modal" onClick={(event) => event.stopPropagation()}>
                <div className="pm-attr-modal__header">
                    <h3>{isEditing ? 'Update Group' : 'Add Group'}</h3>
                    <button type="button" className="pm-attr-modal__close" onClick={onClose} aria-label="Close">
                        x
                    </button>
                </div>

                <div className="pm-group-modal__field">
                    <label htmlFor="group-name" className="pm-field-label">
                        Group Name <span className="pm-required">*</span>
                    </label>
                    <input
                        id="group-name"
                        name="name"
                        value={form.name}
                        onChange={onNameChange}
                        className={errors.name ? 'is-invalid' : ''}
                        disabled={loading}
                    />
                    {errors.name && <span className="pm-field-error">{errors.name}</span>}
                </div>

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

export default AttributeGroupModal;

