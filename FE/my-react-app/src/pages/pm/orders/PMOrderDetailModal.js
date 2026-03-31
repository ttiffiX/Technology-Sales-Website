import React from 'react';
import { formatPrice } from '../../../utils';
import { getOrderDetail } from '../../../api/pm/order/PMOrderAPI';
import './PMOrderDetailModal.scss';

function PMOrderDetailModal({ orderId, onClose }) {
    const [details, setDetails] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const fetchDetails = async () => {
            if (!orderId) return;
            setLoading(true);
            setError('');
            try {
                const data = await getOrderDetail(orderId);
                setDetails(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [orderId]);

    React.useEffect(() => {
        const onEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleOverlayClick = (event) => {
        if (event.target.className === 'pm-order-detail-modal__overlay') {
            onClose();
        }
    };

    const total = details.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    return (
        <div className="pm-order-detail-modal__overlay" onClick={handleOverlayClick}>
            <div className="pm-order-detail-modal">
                <div className="pm-order-detail-modal__header">
                    <h3>Order Products - #{orderId}</h3>
                    <button type="button" onClick={onClose} aria-label="Close">x</button>
                </div>

                <div className="pm-order-detail-modal__body">
                    {loading && <div className="pm-order-detail-modal__placeholder">Loading products...</div>}
                    {!loading && error && <div className="pm-order-detail-modal__placeholder pm-order-detail-modal__placeholder--error">{error}</div>}
                    {!loading && !error && details.length === 0 && (
                        <div className="pm-order-detail-modal__placeholder">No products found</div>
                    )}

                    {!loading && !error && details.length > 0 && (
                        <table className="pm-order-detail-modal__table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((item, index) => (
                                    <tr key={item.id || `${item.productTitle}-${index}`}>
                                        <td>{index + 1}</td>
                                        <td>{item.productTitle || '-'}</td>
                                        <td>{item.categoryName || '-'}</td>
                                        <td>{formatPrice(item.price || 0)}</td>
                                        <td>{item.quantity || 0}</td>
                                        <td>{formatPrice((item.price || 0) * (item.quantity || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5">Total</td>
                                    <td>{formatPrice(total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                <div className="pm-order-detail-modal__footer">
                    <button type="button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default PMOrderDetailModal;

