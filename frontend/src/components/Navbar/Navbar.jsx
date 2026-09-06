import React, { useContext, useState } from 'react'
import'./Navbar.css'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
export default function Navbar() {

    const[menu,setMenu]=useState("");
    const {getTotalCartItems}=useContext(ShopContext);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [accountOpen, setAccountOpen] = useState(false);
    const isAuthenticated = Boolean(localStorage.getItem('auth-token'));

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const submitSearch = (event) => {
        event.preventDefault();
        navigate(`/collection${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
        setSearchOpen(false);
    };

  return (
    <div className='navbar'>
        <Link className="nav-logo" to="/" aria-label="Shopper home">
            <img src={logo} alt= "Shopper"/>
            <p>SHOPPER</p>
        </Link>
        <button className="nav-menu-toggle" type="button" onClick={toggleMenu} aria-label="Open navigation menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button>
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <li onClick={()=>{setMenu("home"); setMenuOpen(false)}}><Link style={{textDecoration:'none'}} to='/'>Home</Link>{menu==="home"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("collection"); setMenuOpen(false)}}><Link style={{textDecoration:'none'}} to='/collection'>Collection</Link>{menu==="collection"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("about"); setMenuOpen(false)}}><Link style={{textDecoration:'none'}} to='/about'>About</Link>{menu==="about"?<hr/>:<></>}</li>
            <li onClick={()=>{setMenu("contact"); setMenuOpen(false)}}><Link style={{textDecoration:'none'}} to='/contact'>Contact</Link>{menu==="contact"?<hr/>:<></>}</li>
            <li className="nav-mobile-account">
                {isAuthenticated ? <><Link to='/profile' onClick={() => setMenuOpen(false)}>My Profile</Link><Link to='/orders' onClick={() => setMenuOpen(false)}>Orders</Link><button type="button" onClick={()=>{localStorage.removeItem('auth-token');window.location.replace("/")}}>Logout</button></> : <Link to='/login' onClick={() => setMenuOpen(false)}>Login</Link>}
            </li>

        </ul>
        <div className="nav-login-cart">
            <button className="nav-search-button" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="Search products">Search</button>
            {isAuthenticated?
            <div className="nav-account"><button className="nav-account-trigger" type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>Account <span>⌄</span></button>{accountOpen && <div className="nav-account-menu"><Link to='/profile' onClick={() => setAccountOpen(false)}>My Profile</Link><Link to='/orders' onClick={() => setAccountOpen(false)}>Orders</Link><button type="button" onClick={()=>{localStorage.removeItem('auth-token');window.location.replace("/")}}>Logout</button></div>}</div>
            :<Link to='/login'><button>Login</button></Link>}
            
            <Link className="nav-cart-link" to='/cart'><img src={cart_icon} alt="Cart" /><span className="nav-cart-count">{getTotalCartItems()}</span></Link>
        </div>
        {searchOpen && <form className="nav-search-panel" onSubmit={submitSearch}><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /><button type="submit">Search</button></form>}
    </div>
  )
}
