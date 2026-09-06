import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChangePassword.css'
import adminFetch from '../../utils/adminFetch'
import { apiUrl } from '../../utils/adminFetch'

const ChangePassword = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setMessage({ type: '', text: '' })
    if (form.newPassword.length < 8) return setMessage({ type: 'error', text: 'New password must be at least 8 characters.' })
    if (form.newPassword !== form.confirmPassword) return setMessage({ type: 'error', text: 'New passwords do not match.' })
    setSaving(true)

    try {
      const response = await adminFetch(apiUrl('/admin/password'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to change password.')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({ type: 'success', text: 'Password changed successfully.' })
    } catch (requestError) {
      setMessage({ type: 'error', text: requestError.message || 'Unable to change password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="change-password-page">
      <section className="change-password-card">
        <button className="change-password-back" type="button" onClick={() => navigate('/')}>Back to overview</button>
        <p className="change-password-kicker">ACCOUNT SECURITY</p>
        <h1>Change password</h1>
        <p className="change-password-copy">Keep your admin account protected with a strong password.</p>
        <form onSubmit={submit}>
          <label>Current password<input name="currentPassword" type="password" value={form.currentPassword} onChange={updateField} required /></label>
          <label>New password<input name="newPassword" type="password" value={form.newPassword} onChange={updateField} minLength="8" required /></label>
          <label>Confirm new password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} minLength="8" required /></label>
          {message.text && <p className={`change-password-message ${message.type}`} role="status">{message.text}</p>}
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update password'}</button>
        </form>
      </section>
    </main>
  )
}

export default ChangePassword
