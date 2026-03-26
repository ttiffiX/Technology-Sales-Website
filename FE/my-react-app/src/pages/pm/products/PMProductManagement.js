import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../api/ProductAPI';
import {
    addProduct,
    deletePMProduct,
    getAttributesByCategory,
    getPMProducts,
    updatePMProductState,
} from '../../../api/PMAPI';
import { useToast } from '../../../components/Toast/Toast';
import AddProductModal from '../../../components/modal/addproduct/AddProductModal';
import { formatPrice } from '../../../utils';
import './PMProductManagement.scss';

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

const normalizePMListProduct = (product = {}) => ({
    ...product,
    isActive: typeof product.isActive === 'boolean' ? product.isActive : Boolean(product.active),
});

const extractCreatedProduct = (payload) => {
    if (!payload || typeof payload !== 'object') return null;
    if (payload.id) return payload;
    if (payload.product && payload.product.id) return payload.product;
    if (payload.data && payload.data.id) return payload.data;
    return null;
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
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState(null);
    const [deletingProductId, setDeletingProductId] = useState(null);
    const [activatingProductId, setActivatingProductId] = useState(null);
    const hasFetchedInitialDataRef = useRef(false);

    const loadProducts = async () => {
        setLoadingProducts(true);
        setProductsError(null);

        try {
            const data = await getPMProducts();
            setProducts((Array.isArray(data) ? data : []).map(normalizePMListProduct));
        } catch (_error) {
            setProducts([]);
            setProductsError('Failed to load product list');
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (hasFetchedInitialDataRef.current) {
            return;
        }
        hasFetchedInitialDataRef.current = true;

        getAllCategories()
            .then(setCategories)
            .catch(() => {
                triggerToast('error', 'Failed to load categories');
            });

        loadProducts();
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

        if (productForm.quantity === '') {
            nextErrors.quantity = 'Quantity is required';
        } else if (Number.isNaN(Number(productForm.quantity)) || Number(productForm.quantity) < 0) {
            nextErrors.quantity = 'Quantity must be a valid number >= 0';
        }

        if (
            productForm.quantitySold !== '' &&
            (Number.isNaN(Number(productForm.quantitySold)) || Number(productForm.quantitySold) < 0)
        ) {
            nextErrors.quantitySold = 'Quantity sold must be a valid number >= 0';
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
            const responsePayload = await addProduct(
                {
                    ...productForm,
                    attributes: attributeValues,
                },
                attributes
            );

            const createdProduct = extractCreatedProduct(responsePayload);

            if (createdProduct?.id) {
                const nextProduct = normalizePMListProduct(createdProduct);
                setProducts((prev) => [
                    nextProduct,
                    ...prev.filter((item) => item.id !== nextProduct.id),
                ]);
            } else {
                // Fallback only when BE does not return created product payload.
                await loadProducts();
            }

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

    const handleDeleteProduct = async (productId) => {
        const confirmed = window.confirm('Are you sure you want to delete this product?');
        if (!confirmed) {
            return;
        }

        setDeletingProductId(productId);
        try {
            await deletePMProduct(productId);
            triggerToast('success', 'Product deleted successfully');
            setProducts((prev) => prev.filter((item) => item.id !== productId));
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'Failed to delete product';
            triggerToast('error', message);
        } finally {
            setDeletingProductId(null);
        }
    };

    const handleToggleActiveProduct = async (productId, nextActiveState) => {
        const actionLabel = nextActiveState ? 'activate' : 'deactivate';
        const confirmed = window.confirm(`Are you sure you want to ${actionLabel} this product?`);
        if (!confirmed) {
            return;
        }

        setActivatingProductId(productId);
        try {
            await updatePMProductState(productId, nextActiveState);

            setProducts((prev) => prev.map((item) => (
                item.id === productId ? { ...item, isActive: nextActiveState } : item
            )));
            triggerToast('success', `Product ${nextActiveState ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                `Failed to ${actionLabel} product`;
            triggerToast('error', message);
        } finally {
            setActivatingProductId(null);
        }
    };

    return (
        <div className="pm-page">
            <div className="pm-page-header">
                <h2>Products</h2>
                <p>Manage all products in your store</p>
            </div>

            <div className="pm-content">
                <div className="pm-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm/products')}>
                        ← Product workspace
                    </button>

                    <button className="pm-btn-add" onClick={openAddModal}>
                        + Add Product
                    </button>
                </div>

                {loadingProducts && (
                    <div className="pm-product-list-placeholder">
                        <p>Loading products...</p>
                    </div>
                )}

                {!loadingProducts && productsError && (
                    <div className="pm-product-list-placeholder pm-product-list-placeholder--error">
                        <p>{productsError}</p>
                        <button type="button" className="pm-btn-reload" onClick={loadProducts}>
                            Reload
                        </button>
                    </div>
                )}

                {!loadingProducts && !productsError && products.length === 0 && (
                    <div className="pm-product-list-placeholder">
                        <p>No products found.</p>
                    </div>
                )}

                {!loadingProducts && !productsError && products.length > 0 && (
                    <div className="pm-product-table-wrapper">
                        <table className="pm-product-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Active</th>
                                    <th className="pm-product-table__actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.title}</td>
                                        <td>{product.categoryName || '-'}</td>
                                        <td>{formatPrice(product.price)}</td>
                                        <td>
                                            <span className={`pm-active-badge ${product.isActive ? 'pm-active-badge--on' : 'pm-active-badge--off'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="pm-product-table__actions">
                                            <button
                                                type="button"
                                                className="pm-action-btn pm-action-btn--view"
                                                onClick={() => navigate(`/pm/products/list/${product.id}`)}
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className={`pm-action-btn ${product.isActive ? 'pm-action-btn--deactivate' : 'pm-action-btn--active'}`}
                                                onClick={() => handleToggleActiveProduct(product.id, !product.isActive)}
                                                disabled={activatingProductId === product.id}
                                            >
                                                {activatingProductId === product.id
                                                    ? (product.isActive ? 'Deactivating...' : 'Activating...')
                                                    : (product.isActive ? 'Deactivate' : 'Active')}
                                            </button>
                                            <button
                                                type="button"
                                                className="pm-action-btn pm-action-btn--delete"
                                                onClick={() => handleDeleteProduct(product.id)}
                                                disabled={deletingProductId === product.id}
                                            >
                                                {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onSubmit={handleAddProduct}
                savingProduct={savingProduct}
                categories={categories}
                productForm={productForm}
                formErrors={formErrors}
                loadingAttr={loadingAttr}
                errorAttr={errorAttr}
                attributes={attributes}
                attributeValues={attributeValues}
                onCategoryChange={handleCategoryChange}
                onBaseFieldChange={handleBaseFieldChange}
                onAttributeChange={handleAttributeChange}
                onListAttributeItemChange={handleListAttributeItemChange}
                onAddListAttributeItem={addListAttributeItem}
                onRemoveListAttributeItem={removeListAttributeItem}
            />
        </div>
    );
}

export default PMProductManagement;




