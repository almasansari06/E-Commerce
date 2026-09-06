import React, { useEffect, useState } from 'react';
import './Management.css';
import adminFetch from '../../utils/adminFetch';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const response = await adminFetch('http://localhost:4000/admin/users');
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load users.');
    setUsers(data.users);
  };

  useEffect(() => { loadUsers().catch((requestError) => setError(requestError.message)); }, []);

  const toggleStatus = async (user) => {
    const status = user.status === 'disabled' ? 'active' : 'disabled';
    const response = await adminFetch(`http://localhost:4000/admin/users/${user._id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (data.success) setUsers((current) => current.map((item) => item._id === user._id ? data.user : item));
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    const response = await adminFetch(`http://localhost:4000/admin/users/${id}`, { method: 'DELETE' });
    if (response.ok) setUsers((current) => current.filter((user) => user._id !== id));
  };

  return <section className="management-page">
    <div className="management-heading"><div><p>ACCOUNTS</p><h1>Users</h1></div><strong>{users.length} total</strong></div>
    {error && <p className="management-error">{error}</p>}
    <div className="management-list">{users.map((user) => <article className="management-row" key={user._id}>
      <div><h2>{user.name}</h2><p>{user.email}</p></div>
      <span className={user.status === 'disabled' ? 'status status-disabled' : 'status'}>{user.status || 'active'}</span>
      <div className="management-actions"><button onClick={() => toggleStatus(user)}>{user.status === 'disabled' ? 'Enable' : 'Disable'}</button><button onClick={() => deleteUser(user._id)}>Delete</button></div>
    </article>)}</div>
  </section>;
}
