import React from 'react';
import AttributeSchemaFormFields from '../../../../components/modal/add_attribute/AttributeSchemaFormFields';

function AttributeSchemaList({
    attributes,
    expandedId,
    editingId,
    editForm,
    editLoading,
    onToggleExpanded,
    onEdit,
    onEditChange,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    deleteLoadingId,
}) {
    if (attributes.length === 0) {
        return <div className="pm-attr-placeholder">No attributes in this category.</div>;
    }

    return (
        <div className="pm-attr-list">
            {attributes.map((item) => {
                const isExpanded = expandedId === item.attributeId;
                const isEditing = editingId === item.attributeId;

                return (
                    <div className="pm-attr-item" key={item.attributeId}>
                        <button
                            className={`pm-attr-toggle ${isExpanded ? 'is-expanded' : ''}`}
                            onClick={() => onToggleExpanded(item.attributeId)}
                        >
                            <span className="pm-attr-toggle__arrow" aria-hidden="true">&gt;</span>
                            <span className="pm-attr-toggle__content">
                                <span className="pm-attr-toggle__code">{item.code}</span>
                                <span className="pm-attr-toggle__name">{item.name}</span>
                            </span>
                        </button>

                        {isExpanded && (
                            <div className="pm-attr-detail">
                                {isEditing ? (
                                    <AttributeSchemaFormFields
                                        form={editForm}
                                        onChange={onEditChange}
                                        isCodeLocked
                                    />
                                ) : (
                                    <div className="pm-attr-readonly-layout">
                                        <div className="pm-attr-readonly-column">
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Code</span>
                                                <span className="pm-attr-readonly-value">{item.code}</span>
                                            </div>
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Name</span>
                                                <span className="pm-attr-readonly-value">{item.name}</span>
                                            </div>
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Unit</span>
                                                <span className="pm-attr-readonly-value">{item.unit || '-'}</span>
                                            </div>
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Data Type</span>
                                                <span className="pm-attr-readonly-value">{item.dataType}</span>
                                            </div>
                                        </div>

                                        <div className="pm-attr-readonly-column">
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Group Name</span>
                                                <span className="pm-attr-readonly-value">{item.groupName}</span>
                                            </div>
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Group Order</span>
                                                <span className="pm-attr-readonly-value">{item.groupOrder}</span>
                                            </div>
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Display Order</span>
                                                <span className="pm-attr-readonly-value">{item.displayOrder}</span>
                                            </div>
                                            <div className="pm-attr-readonly-field">
                                                <span className="pm-attr-readonly-label">Filterable</span>
                                                <span className="pm-attr-readonly-value">
                                                    {item.isFilterable ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pm-attr-actions">
                                    {isEditing ? (
                                        <>
                                            <button
                                                className="pm-action-btn pm-action-btn--save"
                                                onClick={onSaveEdit}
                                                disabled={editLoading}
                                            >
                                                {editLoading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                className="pm-action-btn pm-action-btn--cancel"
                                                onClick={onCancelEdit}
                                                disabled={editLoading}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="pm-action-btn pm-action-btn--edit"
                                            onClick={() => onEdit(item)}
                                        >
                                            Update
                                        </button>
                                    )}
                                    <button
                                        className="pm-action-btn pm-action-btn--delete"
                                        onClick={() => onDelete(item.attributeId)}
                                        disabled={deleteLoadingId === item.attributeId || isEditing}
                                    >
                                        {deleteLoadingId === item.attributeId ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default AttributeSchemaList;


