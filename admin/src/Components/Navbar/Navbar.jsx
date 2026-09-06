import React, { useState } from 'react'
import './Navbar.css'
import navlogo from  '../../Assets/nav-logo.svg'
import navProfile from '../../Assets/nav-profile.svg'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('admin-token')
    navigate('/login')
    window.location.reload()
  }

  return (
    <div className='navbar'>
      <Link className="admin-brand" to="/" aria-label="Go to admin home"><img src={navlogo} alt="Shopper" className="nav-logo" /><div><strong>ADMIN</strong><span>Store control center</span></div></Link>
      <div className="admin-user"><span className="admin-online"><i /> System online</span><div className="admin-account"><button className="admin-account-trigger" type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-label="Open admin account menu"><img src={navProfile} className='nav-profile' alt="Admin profile" /><span className="admin-account-chevron">⌄</span></button>{accountOpen && <div className="admin-account-menu"><div className="admin-account-heading"><strong>Admin account</strong><span>Store manager</span></div><Link to="/settings/password" onClick={() => setAccountOpen(false)}>Change password</Link><button type="button" onClick={logout}>Log out</button></div>}</div></div>
    </div>
  )
}

export default Navbar
