'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { validateCoupon } from '../../lib/firestore';
import type { Coupon } from '../../../shared/types';

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  couponDiscount: number;
  coupon: Coupon | null;
  onCouponApply: (coupon: Coupon | null, discount: number, code: string) => void;
  showCheckoutButton?: boolean;
}

export default function CartSummary({
  subtotal,
  shipping,
  couponDiscount,
  coupon,
  onCouponApply,
  showCheckoutButton = true,
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = useState(coupon?.code ?? '');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const router = useRouter();

  const total = Math.max(0, subtotal + (shipping ?? 0) - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    const result = await validateCoupon(couponInput.trim(), subtotal);
    setValidatingCoupon(false);

    if (result.valid && result.coupon) {
      onCouponApply(result.coupon, result.discount, couponInput.trim().toUpperCase());
      toast.success(`Coupon applied! You save Rs. ${result.discount.toLocaleString()}`);
    } else {
      onCouponApply(null, 0, '');
      toast.error(result.error ?? 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    onCouponApply(null, 0, '');
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    // Fire pixel events
    try {
      if (typeof window !== 'undefined') {
        if ((window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq) {
          (window as typeof window & { fbq: (...args: unknown[]) => void }).fbq('track', 'InitiateCheckout', {
            currency: 'LKR',
            value: total,
          });
        }
        if ((window as typeof window & { ttq?: { track: (...args: unknown[]) => void } }).ttq) {
          (window as typeof window & { ttq: { track: (...args: unknown[]) => void } }).ttq.track('InitiateCheckout', {
            currency: 'LKR',
            value: total,
          });
        }
      }
    } catch { /* Pixel unavailable */ }

    router.push('/checkout');
  };

  return (
    <div
      className="p-4 rounded-3"
      style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', position: 'sticky', top: '100px' }}
    >
      <h5 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
        Order Summary
      </h5>

      <div className="d-flex justify-content-between mb-2">
        <span style={{ color: '#555' }}>Subtotal</span>
        <span style={{ fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span style={{ color: '#555' }}>Shipping</span>
        <span style={{ fontWeight: 600, color: '#888' }}>
          {shipping !== undefined
            ? shipping === 0
              ? <span style={{ color: '#28a745' }}>FREE</span>
              : `Rs. ${shipping.toLocaleString()}`
            : 'Calculated at checkout'}
        </span>
      </div>

      {couponDiscount > 0 && (
        <div className="d-flex justify-content-between mb-2">
          <span style={{ color: '#28a745' }}>
            Discount ({coupon?.code})
          </span>
          <span style={{ fontWeight: 600, color: '#28a745' }}>
            −Rs. {couponDiscount.toLocaleString()}
          </span>
        </div>
      )}

      <hr style={{ borderColor: 'var(--gray-200)' }} />

      <div className="d-flex justify-content-between mb-4">
        <span style={{ fontWeight: 700, fontSize: '17px' }}>Total</span>
        <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>
          Rs. {total.toLocaleString()}
        </span>
      </div>

      {/* Coupon */}
      <div className="mb-4">
        <label htmlFor="coupon-input" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
          Coupon Code
        </label>
        <div className="d-flex gap-2">
          <input
            id="coupon-input"
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="form-control"
            style={{ fontSize: '13px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            disabled={!!coupon}
          />
          {coupon ? (
            <button
              onClick={handleRemoveCoupon}
              className="btn btn-outline-danger"
              style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
            >
              Remove
            </button>
          ) : (
            <button
              onClick={handleApplyCoupon}
              className="btn btn-secondary"
              disabled={validatingCoupon || !couponInput.trim()}
              style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
            >
              {validatingCoupon ? 'Checking...' : 'Apply'}
            </button>
          )}
        </div>
      </div>

      {showCheckoutButton && (
        <button
          onClick={handleCheckout}
          className="btn btn-primary w-100 py-2"
          style={{ borderRadius: '30px', fontWeight: 700, fontSize: '16px' }}
        >
          Proceed to Checkout <i className="fas fa-arrow-right ms-2"></i>
        </button>
      )}

      <div className="text-center mt-3">
        <Link href="/products" style={{ fontSize: '13px', color: 'var(--primary)' }}>
          <i className="fas fa-arrow-left me-1"></i> Continue Shopping
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="d-flex justify-content-center gap-4 mt-4">
        {['fa-truck', 'fa-shield-alt', 'fa-leaf'].map((icon, i) => (
          <div key={i} className="text-center">
            <i className={`fas ${icon}`} style={{ color: 'var(--primary)', fontSize: '20px' }}></i>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              {['Free Delivery', 'Secure', 'Natural'][i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
