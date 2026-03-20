import React from 'react';

function CartModal({ cartItems, setShowCart, setShowCheckout, updateQuantity, removeFromCart }) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="modal-overlay" onClick={() => setShowCart(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setShowCart(false)}>×</button>
        
        <h2>Shopping Cart</h2>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">Rs. {item.price}</p>
                    
                    <div className="cart-item-quantity">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                  
                  <button 
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <span>Total:</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;