// components/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { provinces, getDistricts, getMunicipalities, getDeliveryCharge } from '../utils/nepalLocations';
import ESewaQR from './eSewaQR';

function Checkout({ cartItems, setShowCheckout, setShowCart, clearCart }) {
  const [step, setStep] = useState(1);
  const [showESewaQR, setShowESewaQR] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu',
    wardNo: '',
    tole: '',
    deliveryNote: '',
    paymentMethod: 'cod'
  });

  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(100);
  const [errors, setErrors] = useState({});

  // Update districts when province changes
  useEffect(() => {
    const districts = getDistricts(formData.province);
    setAvailableDistricts(districts);
    setFormData(prev => ({ ...prev, district: districts[0] || '' }));
  }, [formData.province]);

  // Update municipalities when district changes
  useEffect(() => {
    if (formData.province && formData.district) {
      const municipalities = getMunicipalities(formData.province, formData.district);
      setAvailableMunicipalities(municipalities);
      setFormData(prev => ({ ...prev, municipality: municipalities[0] || '' }));
    }
  }, [formData.province, formData.district]);

  // Update delivery charge when province changes
  useEffect(() => {
    const charge = getDeliveryCharge(formData.province);
    setDeliveryCharge(charge);
  }, [formData.province]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + deliveryCharge;
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
      else if (!/^9[78]\d{8}$/.test(formData.phone)) newErrors.phone = 'Valid Nepali mobile number required';
      if (!formData.province) newErrors.province = 'Province is required';
      if (!formData.district) newErrors.district = 'District is required';
      if (!formData.municipality) newErrors.municipality = 'Municipality is required';
      if (!formData.wardNo) newErrors.wardNo = 'Ward number is required';
      else if (formData.wardNo < 1 || formData.wardNo > 35) newErrors.wardNo = 'Ward number must be 1-35';
      if (!formData.tole) newErrors.tole = 'Tole/area is required';
    }
    
    if (step === 2 && !formData.paymentMethod) {
      newErrors.paymentMethod = 'Select payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 2 && formData.paymentMethod === 'esewa') {
        // Store total for QR payment
        localStorage.setItem('pending_amount', calculateTotal().toFixed(2));
        setShowESewaQR(true);
      } else {
        setStep(step + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePaymentComplete = (paymentData) => {
    setPaymentSubmitted(true);
    setShowESewaQR(false);
    // Store payment info with order
    localStorage.setItem('pending_payment', JSON.stringify(paymentData));
    setStep(3);
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = () => {
    if (validateStep()) {
      const orderNumber = 'FURN' + Date.now().toString().slice(-8);
      
      // Store order in admin panel (localStorage for now)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = {
        orderNumber,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          province: formData.province,
          district: formData.district,
          municipality: formData.municipality,
          wardNo: formData.wardNo,
          tole: formData.tole,
          deliveryNote: formData.deliveryNote
        },
        items: cartItems,
        subtotal: calculateSubtotal(),
        deliveryCharge,
        total: calculateTotal(),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'awaiting_verification',
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        esewaPayment: localStorage.getItem('pending_payment') ? JSON.parse(localStorage.getItem('pending_payment')) : null
      };
      
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Clear pending payment data
      localStorage.removeItem('pending_payment');
      localStorage.removeItem('pending_amount');
      
      alert(`Order placed successfully!\nOrder Number: ${orderNumber}\n\nYou can track your order status in My Orders section.`);
      clearCart();
      setShowCheckout(false);
      setShowCart(false);
    }
  };

  return (
    <div className="checkout-overlay" onClick={() => !showESewaQR && setShowCheckout(false)}>
      <div className="checkout-container" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={() => setShowCheckout(false)}>×</button>
        
        {showESewaQR ? (
          <div className="esewa-modal">
            <button className="close-esewa" onClick={() => setShowESewaQR(false)}>×</button>
            <ESewaQR onPaymentComplete={handlePaymentComplete} />
          </div>
        ) : (
          <>
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
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
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
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="number"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="98XXXXXXXX"
                          className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Province *</label>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={(e) => setFormData({...formData, province: e.target.value})}
                          className={errors.province ? 'error' : ''}
                        >
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        {errors.province && <span className="error-message">{errors.province}</span>}
                      </div>
                      <div className="form-group">
                        <label>District *</label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={(e) => setFormData({...formData, district: e.target.value})}
                          className={errors.district ? 'error' : ''}
                        >
                          {availableDistricts.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                        {errors.district && <span className="error-message">{errors.district}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Municipality *</label>
                        <select
                          name="municipality"
                          value={formData.municipality}
                          onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                          className={errors.municipality ? 'error' : ''}
                        >
                          {availableMunicipalities.map(muni => (
                            <option key={muni} value={muni}>{muni}</option>
                          ))}
                        </select>
                        {errors.municipality && <span className="error-message">{errors.municipality}</span>}
                      </div>
                      <div className="form-group">
                        <label>Ward No. *</label>
                        <input
                          type="number"
                          name="wardNo"
                          value={formData.wardNo}
                          onChange={(e) => setFormData({...formData, wardNo: e.target.value})}
                          min="1"
                          max="35"
                          className={errors.wardNo ? 'error' : ''}
                        />
                        {errors.wardNo && <span className="error-message">{errors.wardNo}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tole/Area *</label>
                      <input
                        type="text"
                        name="tole"
                        value={formData.tole}
                        onChange={(e) => setFormData({...formData, tole: e.target.value})}
                        placeholder="e.g., Ganesh Chowk, Main Road"
                        className={errors.tole ? 'error' : ''}
                      />
                      {errors.tole && <span className="error-message">{errors.tole}</span>}
                    </div>

                    <div className="form-group">
                      <label>Delivery Notes (Optional)</label>
                      <textarea
                        name="deliveryNote"
                        value={formData.deliveryNote}
                        onChange={(e) => setFormData({...formData, deliveryNote: e.target.value})}
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
                      <label className={`payment-method ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        />
                        <span className="payment-icon">💵</span>
                        <div className="payment-details">
                          <span className="payment-name">Cash on Delivery</span>
                          <span className="payment-desc">Pay when you receive the product</span>
                        </div>
                      </label>

                      <label className={`payment-method ${formData.paymentMethod === 'esewa' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="esewa"
                          checked={formData.paymentMethod === 'esewa'}
                          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        />
                        <span className="payment-icon">📱</span>
                        <div className="payment-details">
                          <span className="payment-name">eSewa</span>
                          <span className="payment-desc">Pay with eSewa wallet</span>
                        </div>
                      </label>
                    </div>
                    {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
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
                          {formData.tole}, {formData.municipality}-{formData.wardNo}<br />
                          {formData.district}, {formData.province}
                        </p>
                        {formData.deliveryNote && <p><strong>Note:</strong> {formData.deliveryNote}</p>}
                        <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                      </div>

                      <div className="review-group">
                        <h4>Payment Method</h4>
                        <p>{formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'eSewa'}</p>
                        {paymentSubmitted && (
                          <p className="payment-status">✓ Payment verification submitted</p>
                        )}
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
                    <span>Rs. {deliveryCharge}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>Rs. {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;