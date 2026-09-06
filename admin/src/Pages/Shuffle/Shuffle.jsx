import React, { useState } from 'react';
import '../Users/Management.css';
import adminFetch from '../../utils/adminFetch';

export default function Shuffle() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const shuffle = async () => {
    if (!window.confirm('Shuffle product display order?')) return;
    setLoading(true); setMessage('');
    try {
      const response = await adminFetch('http://localhost:4000/admin/shuffle', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to shuffle products.');
      setMessage(data.message);
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };
  return <section className="management-page management-centered"><p>WEBSITE DISPLAY</p><h1>Shuffle products</h1><p>Randomize the order products appear across the storefront.</p><button onClick={shuffle} disabled={loading}>{loading ? 'Shuffling...' : 'Shuffle all products'}</button>{message && <strong>{message}</strong>}</section>;
}
