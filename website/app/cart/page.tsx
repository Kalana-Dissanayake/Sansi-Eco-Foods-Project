'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import CartItemComponent from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import type { Coupon } from '../../../shared/types';

export default function CartPage() {
  const { items, itemCount, subtotalLKR, clearCart } = useCart();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const handleCouponApply = (appliedCoupon: Coupon | null, discount: number, code: string) => {
    setCoupon(appliedCoupon);
    setCouponDiscount(discount);
    setCouponCode(code);
  };

  if (itemCount === 0) {
    return (
      <section className="section-padding cart-empty-container">
        <div className="container text-center py-5">
          <div className="mb-4 cart-empty-icon">
            <i className="fas fa-shopping-basket fa-5x" style={{ color: 'var(--primary-light)' }}></i>
          </div>
          <h2 className="cart-empty-title" style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
            Your cart is empty
          </h2>
          <p className="cart-empty-text" style={{ color: '#888', marginBottom: '32px' }}>
            You haven&apos;t added any products yet. Start exploring our natural snacks!
          </p>
          <Link
            href="/products"
            className="btn btn-primary px-5 py-2 cart-empty-btn"
            style={{ borderRadius: '30px', fontWeight: 700 }}
          >
            Shop Now <i className="fas fa-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-fluid px-lg-5">
        {/* Header */}
        <div className="page-header mb-5" style={{ position: 'relative', padding: '30px 0 20px' }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item active">Shopping Cart</li>
            </ol>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="row g-5">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="table-responsive">
              <table className="table cart-table align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <CartItemComponent key={item.productId} item={item} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <Link
                href="/products"
                className="btn btn-outline-primary"
                style={{ borderRadius: '30px' }}
              >
                <i className="fas fa-arrow-left me-2"></i>Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="btn btn-outline-danger"
                style={{ borderRadius: '30px' }}
              >
                <i className="fas fa-trash me-2"></i>Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <CartSummary
              subtotal={subtotalLKR}
              couponDiscount={couponDiscount}
              coupon={coupon}
              onCouponApply={handleCouponApply}
              showCheckoutButton={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
