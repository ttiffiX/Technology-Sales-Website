import React from 'react';
import { ATTRIBUTE_DATA_TYPES } from '../../../utils';

function AttributeSchemaFormFields({ form, onChange, isCodeLocked = false }) {
    return (
        <div className="pm-attr-form-grid">
            <label>
                {isCodeLocked ? 'Code (locked)' : 'Code'}
                <input name="code" value={form.code} onChange={onChange} disabled={isCodeLocked} />
            </label>
            <label>
                Name
                <input name="name" value={form.name} onChange={onChange} />
            </label>
            <label>
                Unit
                <input name="unit" value={form.unit} onChange={onChange} />
            </label>
            <label>
                Data Type
                <select name="dataType" value={form.dataType} onChange={onChange}>
                    {ATTRIBUTE_DATA_TYPES.map((dataType) => (
                        <option key={dataType} value={dataType}>
                            {dataType}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Group Name
                <input name="groupName" value={form.groupName} onChange={onChange} />
            </label>
            <label>
                Group Order
                <input
                    type="number"
                    min={1}
                    name="groupOrder"
                    value={form.groupOrder}
                    onChange={onChange}
                />
            </label>
            <label>
                Display Order
                <input
                    type="number"
                    min={1}
                    name="displayOrder"
                    value={form.displayOrder}
                    onChange={onChange}
                />
            </label>
            <label className="pm-attr-checkbox-row">
                <input
                    type="checkbox"
                    name="isFilterable"
                    checked={form.isFilterable}
                    onChange={onChange}
                />
                Filterable
            </label>
        </div>
    );
}

export default AttributeSchemaFormFields;

