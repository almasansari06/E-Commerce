import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import './CSS/Profile.css';

const emptyProfile = { firstName: '', lastName: '', email: '', street: '', city: '', state: '', postalCode: '', country: '', phone: '' };

export default function Profile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(emptyProfile);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetch(apiUrl('/profile'), { headers: { 'auth-token': token } })
            .then((response) => response.json())
            .then((data) => {
                if (!data.success) throw new Error(data.message || 'Unable to load profile.');
                setFormData((current) => ({ ...current, ...data.profile }));
            })
            .catch((error) => setMessage({ type: 'error', text: error.message }));
    }, [navigate]);

    const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch(apiUrl('/profile'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'auth-token': localStorage.getItem('auth-token') },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to save profile.');
            setFormData((current) => ({ ...current, ...data.profile }));
            setMessage({ type: 'success', text: 'Profile saved successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="profile-page">
            <header className="profile-header">
                <p>ACCOUNT</p>
                <h1>My profile</h1>
                <span>Keep your delivery details ready for a quicker checkout.</span>
            </header>
            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-section-heading"><span>01</span><div><h2>Personal details</h2><p>How should we address you?</p></div></div>
                <div className="profile-fields profile-fields-two">
                    <label>First name<input name="firstName" value={formData.firstName} onChange={handleChange} required /></label>
                    <label>Last name<input name="lastName" value={formData.lastName} onChange={handleChange} required /></label>
                </div>
                <label>Email address<input type="email" name="email" value={formData.email} readOnly /></label>
                <div className="profile-section-heading"><span>02</span><div><h2>Delivery address</h2><p>Used to prepare and deliver your orders.</p></div></div>
                <label>Street address<input name="street" value={formData.street} onChange={handleChange} required /></label>
                <div className="profile-fields profile-fields-three">
                    <label>City<input name="city" value={formData.city} onChange={handleChange} required /></label>
                    <label>State<input name="state" value={formData.state} onChange={handleChange} required /></label>
                    <label>Postal code<input name="postalCode" value={formData.postalCode} onChange={handleChange} required /></label>
                </div>
                <div className="profile-fields profile-fields-two">
                    <label>Country<input name="country" value={formData.country} onChange={handleChange} required /></label>
                    <label>Phone number<input name="phone" type="tel" value={formData.phone} onChange={handleChange} required /></label>
                </div>
                {message.text && <p className={`profile-message ${message.type}`}>{message.text}</p>}
                <div className="profile-actions"><button type="button" onClick={() => navigate('/')}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save profile'}</button></div>
            </form>
        </main>
    );
}
