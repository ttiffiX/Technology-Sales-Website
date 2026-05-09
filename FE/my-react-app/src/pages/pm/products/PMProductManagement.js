import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getAllCategories} from '../../../api/customer/ProductAPI';
import {
    addProduct,
    deletePMProduct,
    getPMProducts,
    importPMProductsByExcel,
    updatePMProductState,
} from '../../../api/pm/product/ProductAPI';
import {getAttributesByCategory} from '../../../api/pm/product/AttributeAPI';
import {useToast} from '../../../components/Toast/Toast';
import AddProductModal from '../../../components/modal/addproduct/AddProductModal';
import PaginationControls from '../../../components/pagination/PaginationControls';
import {
    formatPrice,
    normalizePMProductFilterParams,
    normalizePMProductPageResponse,
    validatePMProductForm,
} from '../../../utils';
import './PMProductManagement.scss';

const INITIAL_FORM = {
    categoryId: '',
    title: '',
    description: '',
    price: '',
    quantity: '',
    quantitySold: '',
    imageFile: null,
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
    const location = useLocation();
    const {triggerToast} = useToast();
    const initialSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const [categories, setCategories] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productForm, setProductForm] = useState(INITIAL_FORM);
    const [attributes, setAttributes] = useState([]);
    const [attributeValues, setAttributeValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [loadingAttr, setLoadingAttr] = useState(false);
    const [errorAttr, setErrorAttr] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState(null);
    const [keywordInput, setKeywordInput] = useState(initialSearchParams.get('keyword') || '');
    const [appliedKeyword, setAppliedKeyword] = useState(initialSearchParams.get('keyword') || '');
    const [categoryFilterId, setCategoryFilterId] = useState(initialSearchParams.get('categoryId') || '');
    const [sortBy, setSortBy] = useState(initialSearchParams.get('sort') || 'id,desc');
    const [pageNumber, setPageNumber] = useState(() => {
        const parsedPage = Number.parseInt(initialSearchParams.get('page') || '0', 10);
        return Number.isFinite(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
    });
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [deletingProductId, setDeletingProductId] = useState(null);
    const [activatingProductId, setActivatingProductId] = useState(null);
    const hasFetchedInitialDataRef = useRef(false);

    const loadProducts = async (nextPage = pageNumber) => {
        setLoadingProducts(true);
        setProductsError(null);

        try {
            const params = normalizePMProductFilterParams({
                keyword: appliedKeyword,
                categoryId: categoryFilterId,
                sort: sortBy,
                page: nextPage,
                size: pageSize,
            });
            const rawData = await getPMProducts(params);
            const pageData = normalizePMProductPageResponse(rawData);
            const rows = Array.isArray(pageData.content) ? pageData.content : [];

            setProducts(rows.map(normalizePMListProduct));
            setPageNumber(Number.isFinite(pageData.pageNumber) ? pageData.pageNumber : nextPage);
            setTotalPages(Number.isFinite(pageData.totalPages) ? pageData.totalPages : 0);
            setTotalElements(Number.isFinite(pageData.totalElements) ? pageData.totalElements : rows.length);
        } catch (_error) {
            setProducts([]);
            setTotalPages(0);
            setTotalElements(0);
            setProductsError('Failed to load product list');
        } finally {
            setLoadingProducts(false);
        }
    };

    const syncListUrl = (nextState = {}) => {
        const params = new URLSearchParams();
        const nextKeyword = String(nextState.keyword ?? appliedKeyword).trim();
        const nextCategoryId = String(nextState.categoryId ?? categoryFilterId).trim();
        const nextSort = String(nextState.sort ?? sortBy).trim();
        const nextPage = Number.isFinite(nextState.page) ? nextState.page : pageNumber;

        if (nextKeyword) params.set('keyword', nextKeyword);
        if (nextCategoryId) params.set('categoryId', nextCategoryId);
        if (nextSort) params.set('sort', nextSort);
        if (Number.isFinite(nextPage) && nextPage > 0) params.set('page', String(nextPage));

        navigate(
            {
                pathname: '/pm/products/list',
                search: params.toString() ? `?${params.toString()}` : '',
            },
            { replace: true }
        );
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
        if (!hasFetchedInitialDataRef.current) return;
        syncListUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedKeyword, categoryFilterId, sortBy, pageNumber]);

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
        const {name, value, type, checked} = event.target;
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

    const handleImageFileChange = (file) => {
        setProductForm((prev) => ({
            ...prev,
            imageFile: file || null,
        }));
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

    const handleAddProduct = async (event) => {
        event.preventDefault();

        const nextErrors = validatePMProductForm(productForm);
        setFormErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
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
                if (pageNumber === 0) {
                    setProducts((prev) => [
                        nextProduct,
                        ...prev.filter((item) => item.id !== nextProduct.id),
                    ]);
                }
            } else {
                // Fallback only when BE does not return created product payload.
                await loadProducts(0);
            }

            triggerToast('success', 'Product added successfully');
            closeAddModal();
        } catch (error) {
            console.error("DEBUG ERROR OBJECT:", error); // <-- THÊM DÒNG NÀY

            if (error.response) {
                // Server đã trả về phản hồi (status code không phải 2xx)
                console.log("Data từ server:", error.response.data);
                console.log("Status code:", error.response.status);
            } else if (error.request) {
                // Request đã gửi nhưng không nhận được phản hồi (thường là lỗi mạng)
                console.log("Request bị lỗi (không nhận được phản hồi):", error.request);
            } else {
                // Lỗi do cấu hình axios hoặc code của bạn
                console.log("Lỗi khác:", error.message);
            }
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.response?.message ||
                'Failed to add product';

            triggerToast('error', message);
        } finally {
            setSavingProduct(false);
        }
    };

    const handleImportProducts = async ({categoryId, file}) => {
        if (!categoryId || !file) {
            return;
        }

        setSavingProduct(true);
        setImportProgress(0);

        try {
            await importPMProductsByExcel(categoryId, file, (event) => {
                if (!event?.total) {
                    return;
                }

                const percent = Math.round((event.loaded * 100) / event.total);
                setImportProgress(Math.min(95, percent));
            });

            setImportProgress(100);
            triggerToast('success', 'Products imported successfully');
            await loadProducts(pageNumber);
            closeAddModal();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data ||
                'Failed to import products from Excel';
            triggerToast('error', message);
        } finally {
            setSavingProduct(false);
            setTimeout(() => setImportProgress(0), 300);
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

    const applyFilters = () => {
        setAppliedKeyword(keywordInput.trim());
        setPageNumber(0);
    };

    const resetFilters = () => {
        setKeywordInput('');
        setAppliedKeyword('');
        setCategoryFilterId('');
        setSortBy('id,desc');
        setPageNumber(0);
        navigate('/pm/products/list', { replace: true });
    };

    useEffect(() => {
        if (!hasFetchedInitialDataRef.current) {
            return;
        }
        loadProducts(pageNumber);
    }, [appliedKeyword, categoryFilterId, sortBy, pageNumber]);

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
                item.id === productId ? {...item, isActive: nextActiveState} : item
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
                        ← Product Workspace
                    </button>

                    <button className="pm-btn-add" onClick={openAddModal}>
                        + Add Product
                    </button>
                </div>

                <div className="pm-filter-container">
                    <div className="pm-filter-row pm-filter-row--first">
                        <input
                            type="text"
                            className="pm-filter-input pm-filter-input--full"
                            placeholder="Search by keyword..."
                            value={keywordInput}
                            onChange={(event) => setKeywordInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    applyFilters();
                                }
                            }}
                        />

                        <select
                            className="pm-filter-select"
                            value={categoryFilterId}
                            onChange={(event) => {
                                setCategoryFilterId(event.target.value);
                                setPageNumber(0);
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="pm-filter-select"
                            value={sortBy}
                            onChange={(event) => {
                                setSortBy(event.target.value);
                                setPageNumber(0);
                            }}
                        >
                            <option value="id,desc">Newest</option>
                            <option value="price,asc">Price: Low to High</option>
                            <option value="price,desc">Price: High to Low</option>
                            <option value="title,asc">Title: A to Z</option>
                            <option value="title,desc">Title: Z to A</option>
                        </select>

                        <button type="button" className="pm-filter-btn" onClick={applyFilters}>
                            Search
                        </button>
                        <button type="button" className="pm-filter-btn pm-filter-btn--ghost" onClick={resetFilters}>
                            Reset
                        </button>
                    </div>
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
                                <th>Quantity</th>
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
                                    <td>{product.quantity}</td>
                                    <td>
                                            <span
                                                className={`pm-active-badge ${product.isActive ? 'pm-active-badge--on' : 'pm-active-badge--off'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                    </td>
                                    <td className="pm-product-table__actions">
                                        <button
                                            type="button"
                                            className="pm-action-btn pm-action-btn--view"
                                            onClick={() => navigate(`/pm/products/list/${product.id}${location.search}`)}
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

                {!loadingProducts && !productsError && (
                    <PaginationControls
                        page={pageNumber}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={setPageNumber}
                        disabled={loadingProducts}
                    />
                )}
            </div>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onSubmit={handleAddProduct}
                onImportSubmit={handleImportProducts}
                savingProduct={savingProduct}
                importProgress={importProgress}
                categories={categories}
                productForm={productForm}
                formErrors={formErrors}
                loadingAttr={loadingAttr}
                errorAttr={errorAttr}
                attributes={attributes}
                attributeValues={attributeValues}
                onCategoryChange={handleCategoryChange}
                onBaseFieldChange={handleBaseFieldChange}
                onFileChange={handleImageFileChange}
                onAttributeChange={handleAttributeChange}
                onListAttributeItemChange={handleListAttributeItemChange}
                onAddListAttributeItem={addListAttributeItem}
                onRemoveListAttributeItem={removeListAttributeItem}
            />
        </div>
    );
}

export default PMProductManagement;




