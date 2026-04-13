import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../../api/customer/ProductAPI';
import { useToast } from '../../../../components/Toast/Toast';
import PMAttributeSchemaView from './PMAttributeSchemaView.js';
import PMAttributeGroupView from './PMAttributeGroupView.js';
import './PMAttributeSchemaManagement.scss';

let cachedPmAttributeCategories = null;

function PMAttributeSchemaManagement() {
    const navigate = useNavigate();
    const { triggerToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [viewMode, setViewMode] = useState('schema');

    useEffect(() => {
        const loadCategories = async () => {
            if (Array.isArray(cachedPmAttributeCategories)) {
                setCategories(cachedPmAttributeCategories);
                return;
            }

            try {
                const data = await getAllCategories();
                const normalized = Array.isArray(data) ? data : [];
                cachedPmAttributeCategories = normalized;
                setCategories(normalized);
            } catch (_error) {
                setCategories([]);
                triggerToast('error', 'Failed to load categories');
            }
        };

        loadCategories();
        // Intentionally run once per mount; categories are cached for this browser session.
    }, []);

    return (
        <div className="pm-attr-page">
            <div className="pm-attr-header">
                <h2>Attributes</h2>
                <p>Manage attribute schemas and groups by category</p>
            </div>

            <div className="pm-attr-content">
                <div className="pm-attr-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm/products')}>
                        ← Product Workspace
                    </button>

                    <select
                        className="pm-attr-category-select"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                    >
                        <option value="">Choose category</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <div className="pm-attr-view-switch">
                        <button
                            type="button"
                            className={`pm-btn-view ${viewMode === 'schema' ? 'is-active' : ''}`}
                            onClick={() => setViewMode('schema')}
                        >
                            Schema
                        </button>
                        <button
                            type="button"
                            className={`pm-btn-view ${viewMode === 'group' ? 'is-active' : ''}`}
                            onClick={() => setViewMode('group')}
                        >
                            Group
                        </button>
                    </div>
                </div>

                {viewMode === 'schema' ? (
                    <PMAttributeSchemaView categoryId={categoryId} />
                ) : (
                    <PMAttributeGroupView categoryId={categoryId} />
                )}
            </div>
        </div>
    );
}

export default PMAttributeSchemaManagement;


