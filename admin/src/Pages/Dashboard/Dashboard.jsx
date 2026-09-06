import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import adminFetch from '../../utils/adminFetch';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      adminFetch('http://localhost:4000/allproducts').then((response) => response.json()),
      adminFetch('http://localhost:4000/admin/orders').then((response) => response.json()),
      adminFetch('http://localhost:4000/admin/users').then((response) => response.json()),
    ]).then(([products, orders, users]) => {
      setStats({ products: Array.isArray(products) ? products.length : 0, orders: orders.orders?.length || 0, users: users.users?.length || 0 });
    }).catch(() => {});
  }, []);

  return <section className="dashboard">
    <div className="dashboard-stats">
      <article><span className="dashboard-stat-icon">P</span><div><small>Catalogue</small><strong>{stats.products}</strong><p>Active products</p></div></article>
      <article><span className="dashboard-stat-icon orange">O</span><div><small>Fulfilment</small><strong>{stats.orders}</strong><p>Total orders</p></div></article>
      <article><span className="dashboard-stat-icon green">U</span><div><small>Community</small><strong>{stats.users}</strong><p>Registered users</p></div></article>
    </div>
    <div className="dashboard-lower"><div><p className="dashboard-section-label">QUICK START</p><h2>Keep the storefront moving</h2><p className="dashboard-muted">Add products with images, descriptions, types, and availability. Then follow each order from processing to delivery.</p></div><div className="dashboard-checklist"><span>01 <b>Build your catalogue</b></span><span>02 <b>Review new orders</b></span><span>03 <b>Keep customers updated</b></span></div></div>
  </section>;
}
