import React, { useEffect, useState } from 'react';
import '../Users/Management.css';
import adminFetch from '../../utils/adminFetch';
import { apiUrl } from '../../utils/adminFetch';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(10);
  const [error, setError] = useState('');

  const loadCoupons = async () => {
    const response = await adminFetch(apiUrl('/admin/coupons'));
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load coupons.');
    setCoupons(data.coupons);
  };
  useEffect(() => { loadCoupons().catch((requestError) => setError(requestError.message)); }, []);

  const addCoupon = async (event) => {
    event.preventDefault();
    const response = await adminFetch(apiUrl('/admin/coupons'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, discountPercentage: discount }) });
    const data = await response.json();
    if (!response.ok || !data.success) { setError(data.message || 'Unable to create coupon.'); return; }
    setCoupons((current) => [data.coupon, ...current]); setCode('');
  };

  const toggleCoupon = async (coupon) => {
    const response = await adminFetch(apiUrl(`/admin/coupons/${coupon._id}/toggle`), { method: 'PATCH' });
    const data = await response.json();
    if (data.success) setCoupons((current) => current.map((item) => item._id === coupon._id ? data.coupon : item));
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    const response = await adminFetch(apiUrl(`/admin/coupons/${id}`), { method: 'DELETE' });
    if (response.ok) setCoupons((current) => current.filter((coupon) => coupon._id !== id));
  };

  return <section className="management-page">
    <div className="management-heading"><div><p>MARKETING</p><h1>Coupons</h1></div></div>
    {error && <p className="management-error">{error}</p>}
    <form className="management-form" onSubmit={addCoupon}><input required value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Coupon code" /><input required min="1" max="100" type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="Discount %" /><button type="submit">Add Coupon</button></form>
    <div className="management-list">{coupons.map((coupon) => <article className="management-row" key={coupon._id}><div><h2>{coupon.code}</h2><p>{coupon.discountPercentage}% discount</p></div><span className="status">{coupon.isActive ? 'Live' : 'Inactive'}</span><div className="management-actions"><button onClick={() => toggleCoupon(coupon)}>{coupon.isActive ? 'Disable' : 'Enable'}</button><button onClick={() => deleteCoupon(coupon._id)}>Delete</button></div></article>)}</div>
  </section>;
}
