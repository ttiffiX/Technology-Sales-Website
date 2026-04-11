import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import './AttributeGroupAccordion.scss';

function AttributeGroupAccordion({
    group,
    rows,
    isExpanded,
    onToggleExpanded,
    isReorderMode,
    isReorderBusy,
    onStartReorder,
    onCancelReorder,
    onSaveReorder,
    onEdit,
    onAskDelete,
}) {
    const handleToggle = () => onToggleExpanded();

    return (
        <div className="pm-attr-accordion">
            <div className="pm-attr-accordion-header" onClick={handleToggle}>
                <div className="pm-attr-accordion-toggle">
                    <span className={`pm-toggle-arrow ${isExpanded ? 'is-open' : ''}`}>▶</span>
                    <div className="pm-accordion-info">
                        <h3 className="pm-group-name">{group.groupName}</h3>
                        <span className="pm-group-meta">
                            Group Order: {group.groupOrder} | Attributes: {rows.length}
                        </span>
                    </div>
                </div>

                {isExpanded && (
                    <div className="pm-group-actions" onClick={(event) => event.stopPropagation()}>
                        {!isReorderMode ? (
                            <button type="button" className="pm-btn-reorder" onClick={onStartReorder}>
                                Reorder
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="pm-btn-reorder-save"
                                    onClick={onSaveReorder}
                                    disabled={isReorderBusy}
                                >
                                    {isReorderBusy ? 'Saving...' : 'Save Order'}
                                </button>
                                <button
                                    type="button"
                                    className="pm-btn-reorder-cancel"
                                    onClick={onCancelReorder}
                                    disabled={isReorderBusy}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="pm-attr-accordion-body">
                    {rows.length > 0 ? (
                        <Droppable droppableId={String(group.groupId)} type="ATTRIBUTE">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`pm-attr-table-wrapper ${snapshot.isDraggingOver ? 'is-drag-over' : ''}`}
                                >
                                    <table className="pm-attr-table">
                                        <thead>
                                            <tr>
                                                <th className="pm-col-drag">{isReorderMode ? 'Drag' : ''}</th>
                                                <th>Attribute ID</th>
                                                <th>Code</th>
                                                <th>Name</th>
                                                <th>Unit</th>
                                                <th>Data Type</th>
                                                <th>Filterable</th>
                                                <th>Display Order</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((attribute, index) => (
                                                <Draggable
                                                    key={attribute.attributeId}
                                                    draggableId={String(attribute.attributeId)}
                                                    index={index}
                                                    isDragDisabled={!isReorderMode || isReorderBusy}
                                                >
                                                    {(draggableProvided, draggableSnapshot) => (
                                                        <tr
                                                            ref={draggableProvided.innerRef}
                                                            {...draggableProvided.draggableProps}
                                                            {...draggableProvided.dragHandleProps}
                                                            className={`pm-attr-row ${draggableSnapshot.isDragging ? 'is-dragging' : ''}`}
                                                        >
                                                            <td className="pm-col-drag">
                                                                {isReorderMode ? <span className="pm-drag-handle">::::</span> : '-'}
                                                            </td>
                                                            <td>{attribute.attributeId}</td>
                                                            <td><code className="pm-code">{attribute.code}</code></td>
                                                            <td>{attribute.name}</td>
                                                            <td>{attribute.unit || '-'}</td>
                                                            <td>
                                                                <span className="pm-badge pm-badge-type">{attribute.dataType}</span>
                                                            </td>
                                                            <td>
                                                                <span className={`pm-badge ${attribute.isFilterable ? 'pm-badge-yes' : 'pm-badge-no'}`}>
                                                                    {attribute.isFilterable ? 'Yes' : 'No'}
                                                                </span>
                                                            </td>
                                                            <td className="pm-text-center">{attribute.displayOrder}</td>
                                                            <td className="pm-col-actions">
                                                                <div className="pm-action-buttons">
                                                                    <button
                                                                        type="button"
                                                                        className="pm-btn-action pm-btn-edit"
                                                                        onClick={() => onEdit(attribute, group.groupId)}
                                                                        disabled={isReorderMode}
                                                                    >
                                                                        Update
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="pm-btn-action pm-btn-delete"
                                                                        onClick={() => onAskDelete(attribute)}
                                                                        disabled={isReorderMode}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </tbody>
                                    </table>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ) : (
                        <div className="pm-attr-empty">
                            <p>No attributes in this group yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AttributeGroupAccordion;

