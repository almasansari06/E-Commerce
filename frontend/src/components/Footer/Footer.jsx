import React from 'react'
import './Footer.css'
import footer_logo from '../Assets/logo_big.png'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footer_logo}alt="" />
        <p>SHOPPER</p>
      </div>
      <ul className="footer-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/collection">Collection</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/delivery-returns">Delivery & Returns</Link></li>
        <li><Link to="/privacy">Privacy</Link></li>

      </ul>
      <div className="footer-copyright">
        <hr />
        <p>Copyright @ 2025 -All Right Reserved</p>
      </div>
    </div>
  )
}
