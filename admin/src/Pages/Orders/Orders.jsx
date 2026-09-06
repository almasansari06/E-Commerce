import React, { useEffect, useState } from 'react';
import './Orders.css';
import adminFetch, { apiUrl, assetUrl } from '../../utils/adminFetch';

const statuses = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const normalizeStatus = (status) => status === 'Processing' ? 'Order Placed' : status;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminFetch(apiUrl('/admin/orders'));
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load orders.');
      setOrders(data.orders);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    const response = await adminFetch(apiUrl(`/admin/orders/${orderId}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      setError(data.message || 'Unable to update order.');
      return;
    }
    setOrders((current) => current.map((order) => order._id === orderId ? data.order : order));
  };

  return (
    <section className="admin-orders">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">OPERATIONS</p>
          <h1>Orders</h1>
        </div>
        <button type="button" onClick={fetchOrders}>Refresh</button>
      </div>
      {error && <p className="admin-error">{error}</p>}
      {loading ? <p>Loading orders...</p> : orders.length === 0 ? <div className="admin-empty">No orders found.</div> : (
        <div className="admin-order-list">
          {orders.map((order) => (
            <article className="admin-order-card" key={order._id}>
              <div className="admin-order-main">
                <p className="admin-order-id">#{order._id.slice(-8).toUpperCase()}</p>
                <h2>{order.address?.firstName} {order.address?.lastName}</h2>
                <p>{order.address?.email} · {new Date(order.date).toLocaleDateString()}</p>
                <div className="admin-order-items">{order.items.map((item, index) => { const image = Array.isArray(item.image) ? item.image[0] : item.image; return <div className="admin-order-item" key={`${item.id}-${index}`}><img src={assetUrl(image)} alt={item.name} /><span><strong>{item.name}</strong><small>Size: {item.size || 'Not specified'} · Qty: {item.quantity || 1}</small></span></div>; })}</div>
              </div>
              <div className="admin-order-meta">
                <strong>${order.amount}</strong>
                <span>{order.items.length} items</span>
              </div>
              <label className="admin-status-control">
                Status
                <select value={normalizeStatus(order.status)} onChange={(event) => updateStatus(order._id, event.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Orders;
