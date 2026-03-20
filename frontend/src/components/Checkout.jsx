// components/Checkout.jsx
import React, { useState } from 'react';
import './Checkout.css';

function Checkout({ cartItems, setShowCheckout, setShowCart, clearCart }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Info - Nepal specific
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kathmandu',
    municipality: '',
    wardNo: '',
    
    // Payment Info
    paymentMethod: 'cod', // cod, esewa, khalti, connectIPS
    
    // Delivery
    deliveryNote: ''
  });

  const [errors, setErrors] = useState({});

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDelivery = () => {
    // Nepal delivery charges based on location
    const deliveryZones = {
      'Kathmandu': 100,
      'Lalitpur': 100,
      'Bhaktapur': 150,
      'Pokhara': 200,
      'Biratnagar': 250,
      'Birgunj': 250,
      'Butwal': 250,
      'Dharan': 300,
      'Nepalgunj': 300,
      'Janakpur': 250,
      'Bharatpur': 200,
      'Hetauda': 200,
      'Dhangadhi': 350,
      'Mahendranagar': 350,
      'Bhadrapur': 300,
      'Damak': 280,
      'Itahari': 280,
      'Tulsipur': 280,
      'Ghorahi': 280,
      'Other': 400
    };
    
    return deliveryZones[formData.city] || 400;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery();
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      else if (formData.fullName.length < 3) newErrors.fullName = 'Name must be at least 3 characters';
      
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
      
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      else if (!/^9[78]\d{8}$/.test(formData.phone)) newErrors.phone = 'Enter valid Nepali mobile number (98XXXXXXXX)';
      
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.municipality) newErrors.municipality = 'Municipality is required';
      if (!formData.wardNo) newErrors.wardNo = 'Ward number is required';
      else if (isNaN(formData.wardNo) || formData.wardNo < 1 || formData.wardNo > 35) newErrors.wardNo = 'Ward number must be between 1-35';
    }
    
    if (step === 2) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = () => {
    if (validateStep()) {
      // Process order
      const orderNumber = 'FURN' + Date.now().toString().slice(-8);
      alert(`Thank you! Your order has been placed successfully. Order Number: ${orderNumber}`);
      clearCart();
      setShowCheckout(false);
      setShowCart(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Nepal cities/districts
  const nepalCities = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar',
    'Birgunj', 'Butwal', 'Dharan', 'Nepalgunj', 'Bharatpur',
    'Hetauda', 'Janakpur', 'Dhangadhi', 'Mahendranagar', 'Bhadrapur',
    'Damak', 'Itahari', 'Tulsipur', 'Ghorahi', 'Other'
  ];

  // Payment methods in Nepal
  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
    { id: 'esewa', name: 'eSewa', icon: '📱' },
    { id: 'khalti', name: 'Khalti', icon: '📱' },
    { id: 'connectips', name: 'Connect IPS', icon: '🏦' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
  ];

  return (
    <div className="checkout-overlay" onClick={() => setShowCheckout(false)}>
      <div className="checkout-container" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={() => setShowCheckout(false)}>×</button>
        
        <div className="checkout-header">
          <h2>Checkout</h2>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Review</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && (
              <div className="checkout-step">
                <h3>Shipping Information</h3>
                
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ram Bahadur Gurung"
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="98XXXXXXXX"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>City/District *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  >
                    {nepalCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Municipality/Rural Municipality *</label>
                    <input
                      type="text"
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleInputChange}
                      placeholder="Tokha Municipality"
                      className={errors.municipality ? 'error' : ''}
                    />
                    {errors.municipality && <span className="error-message">{errors.municipality}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Ward No. *</label>
                    <input
                      type="number"
                      name="wardNo"
                      value={formData.wardNo}
                      onChange={handleInputChange}
                      placeholder="1-35"
                      min="1"
                      max="35"
                      className={errors.wardNo ? 'error' : ''}
                    />
                    {errors.wardNo && <span className="error-message">{errors.wardNo}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address/Tole *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ganesh Temple, Main Road"
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>Delivery Notes (Optional)</label>
                  <textarea
                    name="deliveryNote"
                    value={formData.deliveryNote}
                    onChange={handleInputChange}
                    placeholder="Near landmark, house number, etc."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-step">
                <h3>Select Payment Method</h3>
                
                <div className="payment-methods">
                  {paymentMethods.map(method => (
                    <label key={method.id} className={`payment-method ${formData.paymentMethod === method.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                      />
                      <span className="payment-icon">{method.icon}</span>
                      <span className="payment-name">{method.name}</span>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}

                {formData.paymentMethod === 'bank' && (
                  <div className="bank-details">
                    <h4>Bank Details:</h4>
                    <p>
                      <strong>Bank:</strong> NMB Bank<br />
                      <strong>Account Name:</strong> Furniture Store Pvt. Ltd.<br />
                      <strong>Account Number:</strong> 12345678901234<br />
                      <strong>Branch:</strong> New Road, Kathmandu
                    </p>
                  </div>
                )}

                {formData.paymentMethod === 'esewa' && (
                  <div className="payment-instruction">
                    <p>You will be redirected to eSewa payment page after order confirmation.</p>
                  </div>
                )}

                {formData.paymentMethod === 'khalti' && (
                  <div className="payment-instruction">
                    <p>You will be redirected to Khalti payment page after order confirmation.</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="checkout-step">
                <h3>Review Your Order</h3>
                
                <div className="review-section">
                  <div className="review-group">
                    <h4>Delivery Address</h4>
                    <p>
                      <strong>{formData.fullName}</strong><br />
                      {formData.phone}<br />
                      {formData.email}<br />
                      {formData.address}, {formData.municipality}-{formData.wardNo}<br />
                      {formData.city}
                    </p>
                    {formData.deliveryNote && (
                      <p className="delivery-note">
                        <strong>Note:</strong> {formData.deliveryNote}
                      </p>
                    )}
                    <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                  </div>

                  <div className="review-group">
                    <h4>Payment Method</h4>
                    <p>
                      {paymentMethods.find(m => m.id === formData.paymentMethod)?.name}
                    </p>
                    <button className="edit-btn" onClick={() => setStep(2)}>Edit</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">Rs. {item.price} × {item.quantity}</div>
                  </div>
                  <div className="item-total">Rs. {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs. {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Charge</span>
                <span>Rs. {calculateDelivery().toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>Rs. {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {formData.paymentMethod === 'cod' && (
              <div className="payment-note">
                <p>Cash payment can be made at the time of delivery.</p>
              </div>
            )}
          </div>
        </div>

        <div className="checkout-footer">
          {step > 1 && (
            <button className="back-btn" onClick={handleBack}>
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button className="next-btn" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              Place Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;