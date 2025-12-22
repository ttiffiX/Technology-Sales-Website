import React, {useEffect} from 'react';
import './OrderDetailModal.scss';
import {useGetOrderDetails} from "../../api/OrderAPI";
import {formatPrice} from "../../utils";

const OrderDetailModal = ({orderId, onClose}) => {
    const {orderDetails, loading, error} = useGetOrderDetails(orderId);


    // Close modal when clicking outside
    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content order-detail-modal">
                <div className="modal-header">
                    <h2>Order Products - #{orderId}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : orderDetails.length === 0 ? (
                        <div className="empty">No products found</div>
                    ) : (
                        <div className="products-list">
                            <table className="products-table">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orderDetails.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td className="product-name">{item.productTitle}</td>
                                        <td>{item.categoryName}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td className="quantity">{item.quantity}</td>
                                        <td className="subtotal">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td colSpan="5" className="total-label">Total:</td>
                                    <td className="total-amount">
                                        {formatPrice(
                                            orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)
                                        )}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;

