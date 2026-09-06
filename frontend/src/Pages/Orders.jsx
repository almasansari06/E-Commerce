import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Orders.css';
import { apiUrl } from '../utils/api';

const orderStages = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered'];
const normalizeStatus = (status) => status === 'Processing' ? 'Order Placed' : status;

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadOrders = () => fetch(apiUrl('/orders'), {
            headers: { 'auth-token': token },
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Unable to load orders.');
                }
                setOrders(data.orders);
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setIsLoading(false));

        loadOrders();
        const refreshTimer = window.setInterval(loadOrders, 3000);
        return () => window.clearInterval(refreshTimer);
    }, [navigate]);

    if (isLoading) {
        return <main className="orders-page"><p>Loading orders...</p></main>;
    }

    return (
        <main className="orders-page">
            <div className="orders-header">
                <p>ACCOUNT</p>
                <h1>Your orders</h1>
            </div>
            {error && <p className="orders-error">{error}</p>}
            {!error && orders.length === 0 && (
                <section className="orders-empty">
                    <h2>No orders yet</h2>
                    <p>Your placed orders and delivery status will appear here.</p>
                    <button type="button" onClick={() => navigate('/')}>Start Shopping</button>
                </section>
            )}
            <div className="orders-list">
                {orders.map((order) => (
                    <article className="order-card" key={order._id}>
                        {(() => {
                            const currentStatus = normalizeStatus(order.status);
                            const currentStage = orderStages.indexOf(currentStatus);
                            return <>
                        <div className="order-card-top">
                            <div>
                                <p className="order-label">Order placed</p>
                                <h2>{new Date(order.date).toLocaleDateString()}</h2>
                            </div>
                            <span className="order-status">{currentStatus}</span>
                        </div>
                        <div className="order-items">
                            {order.items.map((item, index) => {
                                const image = Array.isArray(item.image) ? item.image[0] : item.image;
                                return <div className="order-item" key={`${item.id}-${index}`}><img src={image} alt={item.name} /><div><strong>{item.name}</strong><span>Size: {item.size || 'Not specified'}</span><span>Quantity: {item.quantity || 1}</span></div></div>;
                            })}
                        </div>
                        <div className="order-card-details">
                            <span>{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
                            <strong>${order.amount}</strong>
                            <span>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'}</span>
                        </div>
                        {currentStatus === 'Cancelled' && <p className="order-cancelled-message">{order.cancellationReason || 'Due to technical issue, your order has been cancelled.'}</p>}
                        <div className="order-progress" aria-label={`Order status: ${order.status}`}>
                            {orderStages.map((stage, index) => <React.Fragment key={stage}><span className={`order-progress-step ${index <= currentStage ? 'active' : ''} ${index === currentStage ? 'current' : ''}`}><i />{stage}</span>{index < orderStages.length - 1 && <span className={`order-progress-line ${index < currentStage ? 'active' : ''}`} />}</React.Fragment>)}
                        </div>
                            </>;
                        })()}
                    </article>
                ))}
            </div>
        </main>
    );
}
