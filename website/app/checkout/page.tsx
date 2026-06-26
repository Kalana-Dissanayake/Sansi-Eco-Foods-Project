'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector';
import Spinner from '../../components/ui/Spinner';
import { placeOrder } from '../../lib/payment';
import { getSettings } from '../../lib/firestore';
import { SHIPPING_DISTRICT_TIER } from '../../../shared/types';
import type { CustomerFormData, Coupon, SiteSettings } from '../../../shared/types';

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettings = {
  announcementBarEnabled: true,
  announcementBarText: '',
  heroSlides: [],
  featuredProductIds: [],
  shippingRates: { colombo: 250, westernProvince: 300, outstation: 400 },
  minOrderForFreeShipping: 2500,
  whatsappNumber: '+94 77 123 4567',
  contactEmail: 'info@sansiecofoods.com',
  businessAddress: 'Anamaduwa, North Western Province, Sri Lanka',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  metaPixelId: '',
  tiktokPixelId: '',
};

export default function CheckoutPage() {
  const { items, itemCount, subtotalLKR, clearCart } = useCart();
  const { user, customer, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [coupon] = useState<{ code: string; discount: number } | null>(null);

  // Prefill customerData on load when customer profile is available
  useEffect(() => {
    if (customer && user) {
      setCustomerData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || user.email || '',
        deliveryAddress: customer.lastDeliveryAddress || { line1: '', city: '', district: '', province: '' },
        orderNotes: '',
      });
    } else if (user && !customer) {
      setCustomerData({
        name: '',
        phone: '',
        email: user.email || '',
        deliveryAddress: { line1: '', city: '', district: '', province: '' },
        orderNotes: '',
      });
    }
  }, [customer, user]);

  const getShipping = (district?: string): number => {
    if (!district) return DEFAULT_SETTINGS.shippingRates.outstation;
    if (subtotalLKR >= DEFAULT_SETTINGS.minOrderForFreeShipping) return 0;
    const tier = SHIPPING_DISTRICT_TIER[district] ?? 'outstation';
    return DEFAULT_SETTINGS.shippingRates[tier];
  };

  const shippingLKR = getShipping(customerData?.deliveryAddress.district);
  const discountLKR = coupon?.discount ?? 0;
  const totalLKR = Math.max(0, subtotalLKR + shippingLKR - discountLKR);

  const handleFormSubmit = (data: CustomerFormData) => {
    setCustomerData(data);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('You must be signed in to place an order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!customerData || !customerData.name.trim() || !customerData.phone.trim() || !customerData.deliveryAddress.line1.trim() || !customerData.deliveryAddress.city.trim() || !customerData.deliveryAddress.district) {
      // Trigger form submission
      const btn = document.getElementById('checkout-submit-btn') as HTMLInputElement;
      btn?.click();
      return;
    }

    setIsSubmitting(true);
    try {
      const settings = (await getSettings()) ?? DEFAULT_SETTINGS;
      const result = await placeOrder(items, customerData, coupon, 'COD', settings, user.uid);

      if (result.success && result.orderId) {
        clearCart();
        router.push(`/order-confirmation/${result.orderId}`);
      } else {
        toast.error(result.error ?? 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <section className="section-padding">
        <div className="container text-center py-5">
          <Spinner size="lg" />
          <p className="mt-3 text-muted">Checking authentication status...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section-padding" style={{ background: '#f8f9fa', minHeight: '60vh' }}>
        <div className="container text-center py-5">
          <div className="card border-0 shadow-sm rounded-3 p-5 mx-auto" style={{ maxWidth: '480px' }}>
            <div className="mb-3 text-primary">
              <i className="fas fa-user-lock fa-3x"></i>
            </div>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)' }}>Sign In Required</h3>
            <p className="text-muted mb-4">
              To complete your order at Sansi Eco Foods, please sign in or register a new customer account.
            </p>
            <div className="d-flex flex-column gap-2">
              <Link href="/login?redirect=/checkout" className="btn btn-primary rounded-pill py-2.5" style={{ fontWeight: 700 }}>
                Sign In to Account
              </Link>
              <Link href="/signup?redirect=/checkout" className="btn btn-outline-primary rounded-pill py-2.5" style={{ fontWeight: 700 }}>
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (itemCount === 0) {
    return (
      <section className="section-padding">
        <div className="container text-center py-5">
          <h2>Your cart is empty</h2>
          <Link href="/products" className="btn btn-primary mt-3">Shop Now</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-fluid px-lg-5">
        {/* Page Header */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/cart">Cart</Link></li>
            <li className="breadcrumb-item active">Checkout</li>
          </ol>
        </nav>
        <h1 className="mb-5" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          Checkout
        </h1>

        <div className="row g-5">
          {/* Left Column: Form */}
          <div className="col-lg-7">
            <CheckoutForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialValues={customerData} />
          </div>

          {/* Right Column: Order Summary + Payment */}
          <div className="col-lg-5">
            <div
              className="p-4 rounded-3 mb-4"
              style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '100px' }}
            >
              <h5 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                <i className="fas fa-receipt me-2" style={{ color: 'var(--primary)' }}></i>
                Order Summary
              </h5>

              {/* Item List */}
              <div className="mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: '52px', height: '52px', position: 'relative', borderRadius: '6px', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                      <Image
                        src={item.image || '/images/products/placeholder.png'}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="52px"
                      />
                    </div>
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.name}</div>
                      <div style={{ color: '#888' }}>× {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                      Rs. {(item.priceLKR * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <hr style={{ borderColor: 'var(--gray-200)' }} />

              {/* Totals */}
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#555', fontSize: '14px' }}>Subtotal</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Rs. {subtotalLKR.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#555', fontSize: '14px' }}>Shipping</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: shippingLKR === 0 ? '#28a745' : undefined }}>
                  {customerData
                    ? shippingLKR === 0
                      ? 'FREE'
                      : `Rs. ${shippingLKR.toLocaleString()}`
                    : 'Select district'}
                </span>
              </div>
              {discountLKR > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: '#28a745', fontSize: '14px' }}>Discount</span>
                  <span style={{ fontWeight: 600, color: '#28a745', fontSize: '14px' }}>−Rs. {discountLKR.toLocaleString()}</span>
                </div>
              )}

              <hr style={{ borderColor: 'var(--gray-200)' }} />

              <div className="d-flex justify-content-between mb-4">
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '22px', color: 'var(--primary)' }}>
                  Rs. {totalLKR.toLocaleString()}
                </span>
              </div>

              {/* Payment Method */}
              <PaymentMethodSelector selected="COD" />

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="btn btn-primary w-100 py-2"
                style={{ borderRadius: '30px', fontWeight: 700, fontSize: '16px', position: 'relative' }}
              >
                {isSubmitting ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <Spinner size="sm" color="#fff" />
                    Placing Order...
                  </span>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    Place Order (COD)
                  </>
                )}
              </button>

              <p className="text-center mt-3" style={{ fontSize: '12px', color: '#888' }}>
                <i className="fas fa-lock me-1"></i>
                Your order is secured. You pay when it arrives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
