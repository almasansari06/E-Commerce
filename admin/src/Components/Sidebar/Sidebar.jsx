import React, { useState } from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import add_product from '../../Assets/Product_Cart.svg'
import list_product_icon from '../../Assets/Product_List_icon.svg'

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigation = (
    <>
      <p className="sidebar-label">WORKSPACE</p>
      <NavLink to={'/addproduct'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><img src={add_product} alt="" /><p>Add Product</p></div></NavLink>
      <NavLink to={'/listproduct'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><img src={list_product_icon} alt="" /><p>Product List</p></div></NavLink>
      <NavLink to={'/orders'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><span className="sidebar-symbol">▣</span><p>Orders</p></div></NavLink>
      <NavLink to={'/cancelled'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><span className="sidebar-symbol">×</span><p>Cancelled</p></div></NavLink>
      <p className="sidebar-label sidebar-label-secondary">CUSTOMERS</p>
      <NavLink to={'/users'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><span className="sidebar-symbol">◉</span><p>Users</p></div></NavLink>
      <NavLink to={'/coupons'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><span className="sidebar-symbol">%</span><p>Coupons</p></div></NavLink>
      <NavLink to={'/shuffle'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><span className="sidebar-symbol">↗</span><p>Shuffle</p></div></NavLink>
      <p className="sidebar-label sidebar-label-secondary">ACCOUNT</p>
      <NavLink to={'/settings/password'} className='sidebar-link' onClick={() => setMobileOpen(false)}><div className='sidebar-item'><span className="sidebar-symbol">⌘</span><p>Change password</p></div></NavLink>
    </>
  )

  return (
    <aside className='sidebar'>
      <button className="sidebar-mobile-toggle" type="button" onClick={() => setMobileOpen((open) => !open)}><span>MENU</span><b>{mobileOpen ? '−' : '+'}</b></button>
      <nav className={`sidebar-navigation ${mobileOpen ? 'open' : ''}`}>{navigation}</nav>
    </aside>
  )
}

export default Sidebar
