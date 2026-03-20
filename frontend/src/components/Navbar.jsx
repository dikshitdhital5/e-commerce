// components/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ cartItemsCount, setShowCart, scrollToSection, searchQuery, setSearchQuery }) {
  const { user, setShowAuthModal, setAuthMode, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => scrollToSection('hero')}>
          FURNITURE
        </div>
        
        <div className="nav-links">
          <a onClick={() => scrollToSection('hero')}>Home</a>
          <a onClick={() => scrollToSection('products')}>Products</a>
          <a onClick={() => scrollToSection('collection')}>Collection</a>
          <a onClick={() => scrollToSection('about')}>About</a>
          <a onClick={() => scrollToSection('contact')}>Contact</a>
        </div>
        
        <div className="nav-icons">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span>🔍</span>
          </div>
          
          <div className="icon-wrapper" onClick={() => setShowCart(true)}>
            🛒
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </div>
          
          <div className="user-dropdown-container">
            <div 
              className="icon-wrapper"
              onClick={() => {
                if (!user) {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }
              }}
            >
              👤
            </div>
            
            {user && (
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <a href="#profile">My Profile</a>
                <a href="#orders">My Orders</a>
                <a href="#wishlist">Wishlist</a>
                <a href="#settings">Settings</a>
                <div className="dropdown-divider"></div>
                <a href="#logout" onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}>Logout</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;