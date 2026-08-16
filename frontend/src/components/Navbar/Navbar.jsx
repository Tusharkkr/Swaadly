import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const { cartItems, token, setToken, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartItemCount = Object.values(cartItems).reduce((total, quantity) => total + Math.max(Number(quantity) || 0, 0), 0);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    if (setCartItems) setCartItems({});
    navigate('/')
  }

  return (
    <div className='navbar'>
      <Link to='/' className='navbar-brand'>
        <div className="navbar-brand-copy">
          <strong>Swaadly</strong>
        </div>
      </Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("home")} className={`${menu === "home" ? "active" : ""}`}>Home</Link>
        <a href='/#explore-menu' onClick={() => setMenu("menu")} className={`${menu === "menu" ? "active" : ""}`}>Menu</a>
        <a href='/#app-download' onClick={() => setMenu("mob-app")} className={`${menu === "mob-app" ? "active" : ""}`}>Mobile app</a>
        <a href='/#footer' onClick={() => setMenu("contact")} className={`${menu === "contact" ? "active" : ""}`}>Contact</a>
      </ul>
      <div className="navbar-right">
        <Link to='/cart' className='navbar-cart'>
          <svg className="navbar-cart-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5h2l1.5 10.5h9.8L20 8H7" />
            <path d="M9.5 19.5h.01M17 19.5h.01" />
          </svg>
          <span>Cart</span>
          {cartItemCount > 0 && <b>{cartItemCount}</b>}
        </Link>
        {!token ? <button className="navbar-signin" onClick={() => setShowLogin(true)}>Sign in</button>
          : <div className='navbar-profile'>
            <button className="navbar-profile-button" type="button" aria-label="Open account menu">
              <img src={assets.profile_icon} alt="" />
            </button>
            <ul className='navbar-profile-dropdown'>
              <li onClick={()=>navigate('/myorders')}> <img src={assets.bag_icon} alt="" /> <p>My orders</p></li>
              <hr />
              <li onClick={logout}> <img src={assets.logout_icon} alt="" /> <p>Logout</p></li> 
            </ul>
          </div>
        }

      </div>
    </div>
  )
}

export default Navbar
