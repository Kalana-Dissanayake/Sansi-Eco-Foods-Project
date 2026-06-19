'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getCustomerOrdersByUid, cancelOrder } from '../../lib/firestore';
import { DISTRICT_PROVINCE_MAP } from '../../../shared/types';
import type { Order, DeliveryAddress } from '../../../shared/types';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import Image from 'next/image';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const DISTRICTS = Object.keys(DISTRICT_PROVINCE_MAP).sort();

export default function DashboardPage() {
  const { user, customer, loading: authLoading, updateProfile, signOut } = useAuth();
  const router = useRouter();

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);

  // Active Tab: 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Authentication Guard & Data pre-fill
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (customer) {
      setProfileName(customer.name || '');
      setProfilePhone(customer.phone || '');
      if (customer.lastDeliveryAddress) {
        setLine1(customer.lastDeliveryAddress.line1 || '');
        setCity(customer.lastDeliveryAddress.city || '');
        setDistrict(customer.lastDeliveryAddress.district || '');
      } else if (customer.addresses && customer.addresses.length > 0) {
        setLine1(customer.addresses[0].line1 || '');
        setCity(customer.addresses[0].city || '');
        setDistrict(customer.addresses[0].district || '');
      }
    }
  }, [customer]);

  // Load Customer Orders
  useEffect(() => {
    async function loadOrders() {
      if (user) {
        setOrdersLoading(true);
        const data = await getCustomerOrdersByUid(user.uid);
        setOrders(data);
        setOrdersLoading(false);
      }
    }
    if (user) {
      loadOrders();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profilePhone.trim() || !line1.trim() || !city.trim() || !district) {
      toast.error('All profile fields are required.');
      return;
    }

    setIsUpdatingProfile(true);
    const address: DeliveryAddress = {
      line1,
      city,
      district,
      province: DISTRICT_PROVINCE_MAP[district] || '',
    };

    const result = await updateProfile(profileName.trim(), profilePhone.trim(), address);
    setIsUpdatingProfile(false);

    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update profile details.');
    }
  };

  // Trigger Order Cancellation Modal
  const triggerCancelConfirm = (orderId: string) => {
    setOrderIdToCancel(orderId);
    setIsCancelConfirmOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderIdToCancel) return;
    setIsCancelConfirmOpen(false);

    setIsCancelling(true);
    const reason = cancellationReason.trim() || 'Cancelled by customer';
    const result = await cancelOrder(orderIdToCancel, reason);
    setIsCancelling(false);
    setOrderIdToCancel(null);

    if (result.success) {
      toast.success('Order cancelled successfully.');
      setCancellationReason('');
      setSelectedOrder(null);
      
      // Refresh order list
      const updatedOrders = await getCustomerOrdersByUid(user.uid);
      setOrders(updatedOrders);
    } else {
      toast.error(result.error || 'Failed to cancel order.');
    }
  };

  // Helper to format timestamps
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color coding
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Confirmed':
        return 'bg-info text-white';
      case 'Processing':
        return 'bg-primary text-white';
      case 'Dispatched':
        return 'bg-secondary text-white';
      case 'Delivered':
        return 'bg-success text-white';
      case 'Cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-dark';
    }
  };

  return (
    <section className="section-padding" style={{ background: '#f8f9fa', minHeight: '85vh' }}>
      <div className="container-fluid px-lg-5">
        <div className="row g-4">
          {/* Left Column: Navigation Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
              <div className="text-center mb-4 pb-3 border-b" style={{ borderBottom: '1px solid #eee' }}>
                <div
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '24px', fontWeight: 700 }}
                >
                  {customer?.name ? customer.name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                </div>
                <h5 className="mb-1 text-dark" style={{ fontWeight: 700 }}>{customer?.name || 'Customer'}</h5>
                <span className="text-muted small" style={{ fontSize: '13px' }}>{user.email}</span>
              </div>

              <div className="nav flex-column nav-pills gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`nav-link text-start py-2.5 px-3 rounded-2 ${activeTab === 'orders' ? 'active bg-primary' : 'text-dark hover:bg-light'}`}
                  style={{ fontWeight: 500, fontSize: '14px', border: 'none', background: activeTab === 'orders' ? undefined : 'transparent' }}
                >
                  <i className="fas fa-shopping-bag me-2"></i> My Orders
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`nav-link text-start py-2.5 px-3 rounded-2 ${activeTab === 'profile' ? 'active bg-primary' : 'text-dark hover:bg-light'}`}
                  style={{ fontWeight: 500, fontSize: '14px', border: 'none', background: activeTab === 'profile' ? undefined : 'transparent' }}
                >
                  <i className="fas fa-user-edit me-2"></i> Edit Profile
                </button>
                <hr className="my-3 text-muted" />
                <button
                  onClick={() => signOut()}
                  className="nav-link text-start text-danger py-2.5 px-3 rounded-2"
                  style={{ fontWeight: 500, fontSize: '14px', border: 'none', background: 'transparent' }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content Tab */}
          <div className="col-lg-9">
            {activeTab === 'orders' ? (
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <h4 className="mb-4 text-dark" style={{ fontWeight: 700 }}>
                  <i className="fas fa-receipt me-2" style={{ color: 'var(--primary)' }}></i> Order History & Tracking
                </h4>

                {ordersLoading ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" />
                    <p className="mt-3 text-muted">Retrieving order list...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
                    <h5>No orders placed yet</h5>
                    <p className="text-muted">Explore our healthy dehydrated fruit products and place your first order!</p>
                    <button onClick={() => router.push('/products')} className="btn btn-primary rounded-pill px-4 py-2 mt-2">
                      Shop Snacking Products
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Tracking</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                            <td style={{ fontSize: '13px' }}>{formatDate(order.createdAt)}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                              Rs. {order.totalLKR.toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge px-2.5 py-1.5 rounded-pill ${getStatusBadgeClass(order.orderStatus)}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td style={{ fontSize: '13px' }}>
                              {order.trackingNumber ? (
                                <span className="text-dark" style={{ fontWeight: 500 }}>
                                  <i className="fas fa-shipping-fast me-1 text-primary"></i> {order.trackingNumber}
                                </span>
                              ) : (
                                <span className="text-muted small">Not dispatched yet</span>
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="btn btn-sm btn-outline-primary px-3 rounded-pill"
                                style={{ fontSize: '12px', fontWeight: 600 }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              // Edit Profile Tab
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <h4 className="mb-4 text-dark" style={{ fontWeight: 700 }}>
                  <i className="fas fa-user-cog me-2" style={{ color: 'var(--primary)' }}></i> Edit Profile Details
                </h4>

                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-3 mb-4">
                    {/* Full Name */}
                    <div className="col-md-6">
                      <label htmlFor="profile-name" className="form-label" style={{ fontWeight: 600 }}>Full Name *</label>
                      <input
                        id="profile-name"
                        type="text"
                        className="form-control py-2"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Kasun Perera"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="col-md-6">
                      <label htmlFor="profile-phone" className="form-label" style={{ fontWeight: 600 }}>Phone Number *</label>
                      <input
                        id="profile-phone"
                        type="tel"
                        className="form-control py-2"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="077XXXXXXX"
                        required
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div className="col-12">
                      <label htmlFor="profile-email" className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                      <input
                        id="profile-email"
                        type="email"
                        className="form-control py-2 bg-light text-muted"
                        value={user.email || ''}
                        disabled
                      />
                      <small className="text-muted">Email address cannot be changed as it is used for account login.</small>
                    </div>
                  </div>

                  <hr className="my-4" />
                  <h5 className="mb-3 text-dark" style={{ fontWeight: 700 }}>Saved Delivery Address</h5>

                  <div className="row g-3 mb-4">
                    {/* Line 1 */}
                    <div className="col-12">
                      <label htmlFor="profile-address" className="form-label" style={{ fontWeight: 600 }}>Address Line 1 *</label>
                      <input
                        id="profile-address"
                        type="text"
                        className="form-control py-2"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        placeholder="No. 12, Main Street"
                        required
                      />
                    </div>

                    {/* City */}
                    <div className="col-md-6">
                      <label htmlFor="profile-city" className="form-label" style={{ fontWeight: 600 }}>City / Town *</label>
                      <input
                        id="profile-city"
                        type="text"
                        className="form-control py-2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Colombo 03"
                        required
                      />
                    </div>

                    {/* District */}
                    <div className="col-md-6">
                      <label htmlFor="profile-district" className="form-label" style={{ fontWeight: 600 }}>District *</label>
                      <select
                        id="profile-district"
                        className="form-select py-2"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      >
                        <option value="">Select District</option>
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn btn-primary rounded-pill px-5 py-2.5"
                    style={{ fontWeight: 700 }}
                  >
                    {isUpdatingProfile ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <Spinner size="sm" color="#fff" />
                        Saving Changes...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div
          className="modal show d-block"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
          role="dialog"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-3 shadow-lg">
              <div className="modal-header bg-light border-b p-3">
                <h5 className="modal-title text-dark" style={{ fontWeight: 700 }}>
                  Order Details — {selectedOrder.orderNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setSelectedOrder(null);
                    setCancellationReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Meta details */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <span className="text-muted small">Placed On</span>
                    <p className="mb-0 text-dark" style={{ fontWeight: 600 }}>{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted small">Order Status</span>
                    <div>
                      <span className={`badge px-2.5 py-1.5 rounded-pill ${getStatusBadgeClass(selectedOrder.orderStatus)}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted small">Payment Method</span>
                    <p className="mb-0 text-dark" style={{ fontWeight: 600 }}>Cash on Delivery</p>
                  </div>
                </div>

                {/* Progress bar tracking */}
                <div className="mb-4 p-3 rounded bg-light">
                  <span className="text-muted small d-block mb-3" style={{ fontWeight: 600 }}>Order Tracking Progress</span>
                  
                  {selectedOrder.orderStatus === 'Cancelled' ? (
                    <div className="text-danger d-flex align-items-center gap-2">
                      <i className="fas fa-times-circle fa-lg"></i>
                      <div>
                        <strong>Order Cancelled</strong>
                        <span className="d-block small text-muted">Reason: {selectedOrder.cancellationReason || 'No reason provided'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between text-center position-relative" style={{ fontSize: '12px' }}>
                      {/* Tracking Line */}
                      <div className="position-absolute" style={{ top: '12px', left: '10%', right: '10%', height: '4px', background: '#e0e0e0', zIndex: 1 }}>
                        <div
                          className="bg-success h-100 transition-all duration-500"
                          style={{
                            width:
                              selectedOrder.orderStatus === 'Pending' ? '0%' :
                              selectedOrder.orderStatus === 'Confirmed' ? '25%' :
                              selectedOrder.orderStatus === 'Processing' ? '50%' :
                              selectedOrder.orderStatus === 'Dispatched' ? '75%' :
                              selectedOrder.orderStatus === 'Delivered' ? '100%' : '0%'
                          }}
                        ></div>
                      </div>

                      {[
                        { key: 'Pending', label: 'Placed', icon: 'fa-clipboard-list' },
                        { key: 'Confirmed', label: 'Confirmed', icon: 'fa-check-double' },
                        { key: 'Processing', label: 'Processing', icon: 'fa-cog' },
                        { key: 'Dispatched', label: 'Shipped', icon: 'fa-shipping-fast' },
                        { key: 'Delivered', label: 'Delivered', icon: 'fa-home' },
                      ].map((step, idx) => {
                        const statusSequence = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered'];
                        const currentIdx = statusSequence.indexOf(selectedOrder.orderStatus);
                        const stepIdx = statusSequence.indexOf(step.key);
                        const isDone = stepIdx <= currentIdx;

                        return (
                          <div key={step.key} className="position-relative" style={{ zIndex: 2, width: '18%' }}>
                            <div
                              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${isDone ? 'bg-success text-white' : 'bg-white text-muted border'}`}
                              style={{ width: '28px', height: '28px', fontSize: '12px' }}
                            >
                              <i className={`fas ${step.icon}`}></i>
                            </div>
                            <div style={{ fontWeight: isDone ? 600 : 400, color: isDone ? '#198754' : '#888', fontSize: '11px' }}>{step.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Items */}
                <h6 className="mb-3 text-dark" style={{ fontWeight: 700 }}>Ordered Snacking Packets</h6>
                <div className="mb-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3 mb-3 pb-3 border-b" style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <div style={{ width: '48px', height: '48px', position: 'relative', borderRadius: '4px', overflow: 'hidden', background: '#f8f9fa', border: '1px solid #eee' }}>
                        <Image
                          src={item.productImage || '/images/products/placeholder.png'}
                          alt={item.productName}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1" style={{ fontSize: '13px' }}>
                        <strong className="text-dark">{item.productName}</strong>
                        <span className="d-block text-muted">Rs. {item.priceLKR.toLocaleString()} × {item.quantity}</span>
                      </div>
                      <div className="text-dark" style={{ fontWeight: 700 }}>
                        Rs. {item.subtotalLKR.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="p-3 bg-light rounded mb-4" style={{ fontSize: '14px' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span style={{ fontWeight: 500 }}>Rs. {selectedOrder.subtotalLKR.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Shipping Fee</span>
                    <span style={{ fontWeight: 500 }}>
                      {selectedOrder.shippingLKR === 0 ? 'FREE' : `Rs. ${selectedOrder.shippingLKR.toLocaleString()}`}
                    </span>
                  </div>
                  {selectedOrder.discountLKR > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount ({selectedOrder.couponCode})</span>
                      <span style={{ fontWeight: 500 }}>−Rs. {selectedOrder.discountLKR.toLocaleString()}</span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-dark" style={{ fontSize: '16px' }}>Total Amount Pay</strong>
                    <strong className="text-primary" style={{ fontSize: '20px', fontWeight: 800 }}>
                      Rs. {selectedOrder.totalLKR.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Shipping details */}
                <h6 className="mb-2 text-dark" style={{ fontWeight: 700 }}>Delivery Information</h6>
                <p className="mb-4 text-muted" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  <strong>Recipient:</strong> {selectedOrder.customer.name}<br />
                  <strong>Phone Contact:</strong> {selectedOrder.customer.phone}<br />
                  <strong>Delivery Destination:</strong> {selectedOrder.customer.deliveryAddress.line1}, {selectedOrder.customer.deliveryAddress.city}, {selectedOrder.customer.deliveryAddress.district}, {selectedOrder.customer.deliveryAddress.province}
                </p>

                {/* Cancellation options */}
                {selectedOrder.orderStatus === 'Pending' && (
                  <div className="p-3 border rounded border-danger bg-danger-light">
                    <h6 className="text-danger" style={{ fontWeight: 700 }}>Cancel Order</h6>
                    <p className="text-muted small mb-3">
                      You can cancel this order since it hasn&apos;t been confirmed or processed yet. Please write a brief reason for the cancellation.
                    </p>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g., I ordered the wrong quantity, I want to change address..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => triggerCancelConfirm(selectedOrder.id)}
                      disabled={isCancelling}
                      className="btn btn-sm btn-danger px-4 rounded-pill"
                      style={{ fontWeight: 600 }}
                    >
                      {isCancelling ? (
                        <>
                          <Spinner size="sm" color="#fff" /> Cancelling...
                        </>
                      ) : (
                        'Request Cancellation'
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer border-t p-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 rounded-pill"
                  onClick={() => {
                    setSelectedOrder(null);
                    setCancellationReason('');
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelConfirmOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep"
        type="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setIsCancelConfirmOpen(false);
          setOrderIdToCancel(null);
        }}
      />
    </section>
  );
}
