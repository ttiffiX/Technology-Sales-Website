import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCompare} from '../../contexts/CompareContext';
import {compareProducts} from '../../api/ProductAPI';
import {formatPrice, getImage} from '../../utils';
import Nav from '../../components/navigation/Nav';
import {useCart} from '../../contexts/CartContext';
import './Compare.scss';

function Compare() {
    const navigate = useNavigate();
    const {compareProducts: selectedProducts, categoryId} = useCompare();
    const {cartCount} = useCart();
    const [compareData, setCompareData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompareData = async () => {
            if (!selectedProducts || selectedProducts.length < 2) {
                navigate('/');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const productIds = selectedProducts.map(p => p.id);
                const data = await compareProducts(categoryId, productIds);
                setCompareData(data);
            } catch (err) {
                setError(err.response?.data || "Failed to fetch comparison data");
            } finally {
                setLoading(false);
            }
        };

        fetchCompareData();
    }, [selectedProducts, categoryId, navigate]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    }

    const handleBack = () => {
        navigate(-1);
    };
    if (loading) {
        return (
            <div className="compare-page">
                <Nav count={cartCount}/>
                <div className="loading-container">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="compare-page">
                <Nav count={cartCount}/>
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={handleBack}>Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-page">
            <Nav count={cartCount}/>

            <div className="compare-container">
                <div className="compare-header">
                    <button className="back-btn" onClick={handleBack}>
                        ← Back
                    </button>
                    <h1>Product Comparison</h1>
                </div>

                {compareData && (
                    <div className="compare-table-container">
                        <table className="compare-table">
                            <thead>
                            <tr>
                                <th className="attribute-column">Products</th>
                                {compareData.products.map(product => (
                                    <th key={product.id} className="product-column">
                                        <div
                                            className="product-header"
                                            onClick={() => handleProductClick(product.id)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <div
                                                className="product-image"
                                                style={{backgroundImage: `url(${getImage(product.imageUrl)})`}}
                                            ></div>
                                            <h3>{product.title}</h3>
                                            <p className="product-price">{formatPrice(product.price)}</p>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {/* Dynamic attributes */}
                            {compareData.attributeNames && compareData.attributeNames.map(attrName => (
                                <tr key={attrName}>
                                    <td className="attribute-name">{attrName}</td>
                                    {compareData.products.map(product => {
                                        // attributes is an object/map, not an array
                                        const attrValue = product.attributes?.[attrName];
                                        return (
                                            <td key={product.id} className="attribute-value">
                                                {attrValue || '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Compare;





