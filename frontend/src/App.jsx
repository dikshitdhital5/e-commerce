import React, { useState, useRef } from 'react';
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
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showQuickView, setShowQuickView] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const heroRef = useRef(null);
  const productsRef = useRef(null);
  const collectionRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

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
          setShowCart={setShowCart}
          setShowCheckout={setShowCheckout}
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

export default App;