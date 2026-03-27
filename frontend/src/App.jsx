// App.jsx - FIXED (no duplicate imports)
import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Collection from './components/Collection';
import About from './components/About';
import Contact from './components/Contact';
import CartModal from './components/CartModal';
import QuickViewModal from './components/QuickViewModal';
import Checkout from './components/Checkout';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';

// Main App Content Component
function AppContent() {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showQuickView, setShowQuickView] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const heroRef = useRef(null);
  const productsRef = useRef(null);
  const collectionRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Get user from auth context
  const { user } = useAuth();

  // Check if user is admin 
  const isAdmin = user?.email === 'admin@furniture.com' || window.location.hash === '#admin';

  // Create stable callbacks
  const handleOpenCheckout = useCallback(() => {
    console.log('Opening checkout via callback');
    setShowCheckout(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    console.log('Closing cart via callback');
    setShowCart(false);
  }, []);

  // Add debug effect
  React.useEffect(() => {
    console.log('=== STATE CHANGES ===');
    console.log('showCart:', showCart);
    console.log('showCheckout:', showCheckout);
    
    if (showCheckout) {
      console.log('🎉 CHECKOUT SHOULD BE VISIBLE NOW!');
    }
  }, [showCart, showCheckout]);

  const scrollToSection = (section) => {
    const refs = {
      hero: heroRef,
      products: productsRef,
      collection: collectionRef,
      about: aboutRef,
      contact: contactRef
    };
    
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Toggle admin panel (can be accessed via Ctrl+Shift+A or URL hash)
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(prev => !prev);
      }
    };
    
    if (window.location.hash === '#admin') {
      setShowAdmin(true);
    }
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Make setShowCheckout globally available
  React.useEffect(() => {
    window.forceOpenCheckout = () => {
      console.log('Force opening checkout via window');
      setShowCheckout(true);
    };
    return () => {
      delete window.forceOpenCheckout;
    };
  }, []);

  // If admin panel is shown, display it instead of main content
  if (showAdmin && isAdmin) {
    return (
      <>
        <div style={{ padding: '1rem', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => setShowAdmin(false)}
            style={{
              padding: '0.5rem 1rem',
              background: '#8B7355',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Website
          </button>
          <span style={{ color: '#8B7355', fontWeight: 'bold' }}>Admin Mode</span>
        </div>
        <AdminPanel />
      </>
    );
  }

  return (
    <div className="app">
      <Navbar 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        setShowCart={setShowCart}
        scrollToSection={scrollToSection}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div ref={heroRef}>
        <Hero />
      </div>
      
      <div ref={productsRef}>
        <Products 
          addToCart={addToCart}
          setShowQuickView={setShowQuickView}
          searchQuery={searchQuery}
        />
      </div>
      
      <div ref={collectionRef}>
        <Collection />
      </div>
      
      <div ref={aboutRef}>
        <About />
      </div>
      
      <div ref={contactRef}>
        <Contact />
      </div>

      {showCart && (
        <CartModal 
          cartItems={cartItems}
          setShowCart={handleCloseCart}
          setShowCheckout={handleOpenCheckout}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      )}

      

      {showQuickView && (
        <QuickViewModal 
          product={showQuickView}
          setShowQuickView={setShowQuickView}
          addToCart={addToCart}
        />
      )}

      {showCheckout && (
        <Checkout 
          cartItems={cartItems}
          setShowCheckout={setShowCheckout}
          setShowCart={setShowCart}
          clearCart={clearCart}
        />
      )}

      <AuthModal />
      
   
    </div>
  );
}

// Main App component with AuthProvider wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;