import React, { useState } from 'react'
import './Login.css'
import { apiUrl } from '../../utils/adminFetch'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(apiUrl('/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Invalid admin credentials.')
      localStorage.setItem('admin-token', data.token)
      window.location.href = '/'
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-mark">S</div>
        <p className="admin-login-kicker">SHOPPER CONTROL CENTER</p>
        <h1>Welcome back</h1>
        <p className="admin-login-copy">Sign in to manage your store, products and orders.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="shopper@gmail.com" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in to admin'}</button>
        </form>
      </section>
    </main>
  )
}

export default Login
