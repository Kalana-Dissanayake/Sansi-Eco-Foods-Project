import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, getSettings } from '../../../lib/firestore';

interface OrderConfirmationPageProps {
  params: { orderId: string };
}

export const metadata: Metadata = {
  title: 'Order Confirmed! | Sansi Eco Foods',
  description: 'Your Sansi Eco Foods order has been placed successfully. Cash on Delivery — pay when it arrives!',
};

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const order = await getOrderById(params.orderId);
  const settings = await getSettings();

  if (!order) {
    notFound();
  }

  return (
    <section className="section-padding">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="text-center mb-5">
          {/* Success Icon */}
          <div className="order-success-icon">
            <i className="fas fa-check" style={{ fontSize: '44px', color: '#fff' }}></i>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--dark)' }}>
            Thank You for Your Order!
          </h1>
          <p style={{ color: '#666', fontSize: '17px', marginTop: '8px' }}>
            Your order has been received and will be processed shortly.
          </p>

          {/* Order Number */}
          <div
            className="d-inline-block px-4 py-2 mt-3 rounded-pill"
            style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}
          >
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '18px' }}>
              Order #{order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="p-4 rounded-3 mb-4" style={{ background: '#fff', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
          <h5 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Order Summary
          </h5>

          {/* Items */}
          <div className="mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.productName}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>× {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  Rs. {item.subtotalLKR.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
            <span style={{ color: '#555' }}>Subtotal</span>
            <span>Rs. {order.subtotalLKR.toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
            <span style={{ color: '#555' }}>Shipping</span>
            <span>{order.shippingLKR === 0 ? 'FREE' : `Rs. ${order.shippingLKR.toLocaleString()}`}</span>
          </div>
          {order.discountLKR > 0 && (
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px', color: '#28a745' }}>
              <span>Discount ({order.couponCode})</span>
              <span>−Rs. {order.discountLKR.toLocaleString()}</span>
            </div>
          )}
          <hr />
          <div className="d-flex justify-content-between" style={{ fontWeight: 800, fontSize: '18px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>Rs. {order.totalLKR.toLocaleString()}</span>
          </div>

          {/* Payment Method */}
          <div
            className="mt-4 p-3 rounded"
            style={{ background: 'var(--primary-light)', border: '1px solid rgba(74,124,89,0.2)' }}
          >
            <i className="fas fa-money-bill-wave me-2" style={{ color: 'var(--primary)' }}></i>
            <strong>Payment Method:</strong> Cash on Delivery —{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Pay when your order arrives</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="p-4 rounded-3 mb-4" style={{ background: '#fff', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
          <h5 className="mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Delivery Details
          </h5>
          <p className="mb-1"><strong>{order.customer.name}</strong></p>
          <p className="mb-1" style={{ color: '#555' }}>{order.customer.phone}</p>
          {order.customer.email && <p className="mb-1" style={{ color: '#555' }}>{order.customer.email}</p>}
          <p className="mb-1" style={{ color: '#555' }}>
            {order.customer.deliveryAddress.line1}, {order.customer.deliveryAddress.city}
          </p>
          <p className="mb-3" style={{ color: '#555' }}>
            {order.customer.deliveryAddress.district}, {order.customer.deliveryAddress.province}
          </p>
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
            style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '14px', fontWeight: 600 }}
          >
            <i className="fas fa-truck"></i>
            Expected delivery: 2–5 business days
          </div>
        </div>

        {/* Email Confirmation */}
        {order.customer.email && (
          <div className="text-center mb-4" style={{ color: '#666', fontSize: '14px' }}>
            <i className="fas fa-envelope me-2" style={{ color: 'var(--primary)' }}></i>
            A confirmation has been sent to <strong>{order.customer.email}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          {settings?.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=Hi! I just placed order ${order.orderNumber} on Sansi Eco Foods. I have a question.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn py-2 px-4"
              style={{ background: '#25D366', color: '#fff', borderRadius: '30px', fontWeight: 600 }}
            >
              <i className="fab fa-whatsapp me-2"></i>
              Chat on WhatsApp
            </a>
          )}
          <Link
            href="/products"
            className="btn btn-outline-primary py-2 px-4"
            style={{ borderRadius: '30px', fontWeight: 600 }}
          >
            <i className="fas fa-shopping-bag me-2"></i>
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
