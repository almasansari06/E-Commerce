import React, { useEffect, useState } from 'react';
import '../Users/Management.css';
import adminFetch from '../../utils/adminFetch';

export default function Cancelled() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    adminFetch('http://localhost:4000/admin/cancelled-orders').then((response) => response.json()).then((data) => {
      if (!data.success) throw new Error(data.message); setOrders(data.orders);
    }).catch((requestError) => setError(requestError.message));
  }, []);
  return <section className="management-page"><div className="management-heading"><div><p>OPERATIONS</p><h1>Cancelled orders</h1></div><strong>{orders.length} total</strong></div>{error && <p className="management-error">{error}</p>}<div className="management-list">{orders.map((order) => <article className="management-row" key={order._id}><div><h2>{order.address?.firstName} {order.address?.lastName}</h2><p>{order.address?.email} · {new Date(order.date).toLocaleDateString()}</p></div><span className="status status-disabled">Cancelled</span><strong>${order.amount}</strong></article>)}</div>{!error && orders.length === 0 && <div className="management-empty">No cancelled orders.</div>}</section>;
}
