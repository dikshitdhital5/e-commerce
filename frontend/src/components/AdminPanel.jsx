// components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';

function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  };

  const updateOrderStatus = (orderNumber, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.orderNumber === orderNumber) {
        return { ...order, orderStatus: newStatus };
      }
      return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    alert(`Order ${orderNumber} status updated to ${newStatus}`);
  };

  const updatePaymentStatus = (orderNumber, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.orderNumber === orderNumber) {
        return { ...order, paymentStatus: newStatus };
      }
      return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    alert(`Payment for order ${orderNumber} marked as ${newStatus}`);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.orderStatus === 'pending';
    if (filter === 'processing') return order.orderStatus === 'processing';
    if (filter === 'shipped') return order.orderStatus === 'shipped';
    if (filter === 'delivered') return order.orderStatus === 'delivered';
    return true;
  });

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel - Order Management</h2>
        <div className="filter-buttons">
          <button onClick={() => setFilter('all')}>All</button>
          <button onClick={() => setFilter('pending')}>Pending</button>
          <button onClick={() => setFilter('processing')}>Processing</button>
          <button onClick={() => setFilter('shipped')}>Shipped</button>
          <button onClick={() => setFilter('delivered')}>Delivered</button>
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order.orderNumber} className="order-card">
            <div className="order-header">
              <div>
                <strong>Order #{order.orderNumber}</strong>
                <span className={`status-badge ${order.orderStatus}`}>
                  {order.orderStatus}
                </span>
                <span className={`payment-badge ${order.paymentStatus}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="order-date">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="order-details">
              <div className="customer-info">
                <strong>{order.customer.name}</strong>
                <p>{order.customer.phone}</p>
                <p>{order.customer.email}</p>
                <p className="address">
                  {order.address.tole}, {order.address.municipality}-{order.address.wardNo}<br />
                  {order.address.district}, {order.address.province}
                </p>
              </div>

              <div className="order-items-summary">
                <strong>Items:</strong>
                {order.items.map(item => (
                  <div key={item.id}>
                    {item.name} x {item.quantity} = Rs. {(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total: Rs. {order.total.toFixed(2)}</strong>
                <div>Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'eSewa'}</div>
              </div>
            </div>

            {order.esewaPayment && (
              <div className="esewa-payment-info">
                <h4>eSewa Payment Details</h4>
                <p>Transaction Code: {order.esewaPayment.transactionCode}</p>
                {order.esewaPayment.transactionImage && (
                  <div className="payment-screenshot">
                    <img src={order.esewaPayment.transactionImage} alt="Payment Proof" />
                    <button 
                      onClick={() => window.open(order.esewaPayment.transactionImage, '_blank')}
                      className="view-image-btn"
                    >
                      View Full Image
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="order-actions">
              <select 
                value={order.orderStatus}
                onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>

              {order.paymentStatus === 'awaiting_verification' && (
                <div className="payment-actions">
                  <button 
                    className="verify-payment"
                    onClick={() => updatePaymentStatus(order.orderNumber, 'verified')}
                  >
                    Verify Payment
                  </button>
                  <button 
                    className="reject-payment"
                    onClick={() => updatePaymentStatus(order.orderNumber, 'rejected')}
                  >
                    Reject Payment
                  </button>
                </div>
              )}

              {order.paymentStatus === 'verified' && (
                <span className="verified-badge">✓ Payment Verified</span>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="no-orders">No orders found</div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;