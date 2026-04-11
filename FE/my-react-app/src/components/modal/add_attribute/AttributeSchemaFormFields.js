import React from 'react';
import { ATTRIBUTE_DATA_TYPES } from '../../../utils';

function AttributeSchemaFormFields({
    form,
    errors = {},
    onChange,
    isCodeLocked = false,
    attributeGroups = [],
    showGroupSelect = false,
}) {
    return (
        <div className="pm-attr-form-grid">
            <div className="pm-form-field">
                <label htmlFor="attr-code" className="pm-field-label">
                    {isCodeLocked ? 'Code (locked)' : 'Code'} <span className="pm-required">*</span>
                </label>
                <input
                    id="attr-code"
                    name="code"
                    value={form.code}
                    onChange={onChange}
                    disabled={isCodeLocked}
                    className={errors.code ? 'is-invalid' : ''}
                />
                {errors.code && <span className="pm-field-error">{errors.code}</span>}
            </div>

            <div className="pm-form-field">
                <label htmlFor="attr-name" className="pm-field-label">
                    Name <span className="pm-required">*</span>
                </label>
                <input id="attr-name" name="name" value={form.name} onChange={onChange} className={errors.name ? 'is-invalid' : ''} />
                {errors.name && <span className="pm-field-error">{errors.name}</span>}
            </div>

            {showGroupSelect && (
                <div className="pm-form-field pm-group-field">
                    <label htmlFor="attr-group" className="pm-field-label">
                        Group <span className="pm-required">*</span>
                    </label>
                    <select
                        id="attr-group"
                        name="groupId"
                        value={form.groupId || ''}
                        onChange={onChange}
                        className={errors.groupId ? 'is-invalid' : ''}
                    >
                        <option value="">-- Select Group --</option>
                        {attributeGroups.map((group) => (
                            <option key={group.groupId} value={group.groupId}>
                                {group.groupName}
                            </option>
                        ))}
                    </select>
                    {errors.groupId && <span className="pm-field-error">{errors.groupId}</span>}
                </div>
            )}

            <div className="pm-form-field">
                <label htmlFor="attr-unit" className="pm-field-label">Unit</label>
                <input id="attr-unit" name="unit" value={form.unit} onChange={onChange} className={errors.unit ? 'is-invalid' : ''} />
                {errors.unit && <span className="pm-field-error">{errors.unit}</span>}
            </div>

            <div className="pm-form-field">
                <label htmlFor="attr-data-type" className="pm-field-label">
                    Data Type <span className="pm-required">*</span>
                </label>
                <select id="attr-data-type" name="dataType" value={form.dataType} onChange={onChange} className={errors.dataType ? 'is-invalid' : ''}>
                    {ATTRIBUTE_DATA_TYPES.map((dataType) => (
                        <option key={dataType} value={dataType}>
                            {dataType}
                        </option>
                    ))}
                </select>
                {errors.dataType && <span className="pm-field-error">{errors.dataType}</span>}
            </div>

            <div className="pm-form-field pm-form-field--full pm-attr-checkbox-row">
                <label htmlFor="attr-filterable" className="pm-field-label pm-attr-checkbox-label">Filterable</label>
                <span className="pm-toggle-switch" aria-label="Toggle filterable">
                    <input
                        id="attr-filterable"
                        type="checkbox"
                        name="isFilterable"
                        checked={form.isFilterable}
                        onChange={onChange}
                    />
                    <span className="pm-toggle-slider" />
                </span>
            </div>
        </div>
    );
}

export default AttributeSchemaFormFields;

