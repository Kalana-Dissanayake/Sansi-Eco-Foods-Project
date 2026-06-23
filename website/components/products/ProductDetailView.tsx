'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../../shared/types';

interface ProductDetailViewProps {
  product: Product;
}

function trackViewContent(product: Product) {
  try {
    if (typeof window !== 'undefined') {
      if ((window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq) {
        (window as typeof window & { fbq: (...args: unknown[]) => void }).fbq('track', 'ViewContent', {
          content_ids: [product.id],
          content_name: product.name,
          currency: 'LKR',
          value: product.priceLKR,
        });
      }
      if ((window as typeof window & { ttq?: { track: (...args: unknown[]) => void } }).ttq) {
        (window as typeof window & { ttq: { track: (...args: unknown[]) => void } }).ttq.track('ViewContent', {
          content_id: product.id,
          content_name: product.name,
          currency: 'LKR',
          value: product.priceLKR,
        });
      }
    }
  } catch { /* Pixel not available */ }
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const [mainImage, setMainImage] = useState(product.images[0] ?? '/images/products/placeholder.png');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'delivery'>('description');

  // Track view on mount
  useState(() => { trackViewContent(product); });

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity);
    toast.success(`${product.name} × ${quantity} added to cart!`, { icon: '🛒' });

    try {
      if (typeof window !== 'undefined') {
        if ((window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq) {
          (window as typeof window & { fbq: (...args: unknown[]) => void }).fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            currency: 'LKR',
            value: product.priceLKR * quantity,
          });
        }
      }
    } catch { /* Pixel unavailable */ }
  };

  const maxQty = Math.min(product.stockQuantity, 20);
  const isLowStock = product.inStock && product.stockQuantity <= product.lowStockThreshold;

  return (
    <div className="row g-5">
      {/* Left: Image Gallery */}
      <div className="col-lg-6">
        <div
          style={{
            background: 'var(--light)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '12px',
            aspectRatio: '1',
            position: 'relative',
          }}
        >
          <Image
            src={mainImage}
            alt={`${product.name} ${product.weightGrams}g - Sansi Eco Foods Sri Lanka`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 992px) 100vw, 50vw"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="d-flex gap-2 flex-wrap">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                style={{
                  width: '72px',
                  height: '72px',
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `2px solid ${mainImage === img ? 'var(--primary)' : 'var(--gray-200)'}`,
                  padding: 0,
                  cursor: 'pointer',
                  background: 'var(--light)',
                  transition: 'border-color 0.2s',
                }}
                aria-label={`View product image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="col-lg-6">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: '13px' }}>
            <li className="breadcrumb-item"><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
            <li className="breadcrumb-item"><Link href="/products" style={{ color: 'var(--primary)' }}>Products</Link></li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 34px)', marginBottom: '12px' }}>
          {product.name}
        </h1>

        {/* Health Tags */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {product.healthTags.map((tag) => (
            <span key={tag} className="badge-natural">{tag}</span>
          ))}
        </div>

        {/* SKU & Stock */}
        <div className="d-flex align-items-center gap-3 mb-3" style={{ fontSize: '14px' }}>
          <span style={{ color: '#888' }}>SKU: {product.skuCode}</span>
          {product.inStock ? (
            <span style={{ color: '#28a745', fontWeight: 600 }}>
              <i className="fas fa-check-circle me-1"></i>In Stock
              {isLowStock && <span className="ms-2" style={{ color: 'var(--secondary)' }}>— Only {product.stockQuantity} left!</span>}
            </span>
          ) : (
            <span style={{ color: '#dc3545', fontWeight: 600 }}>
              <i className="fas fa-times-circle me-1"></i>Out of Stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
          <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
            Rs. {product.priceLKR.toLocaleString()}
          </span>
          {product.compareAtPriceLKR > product.priceLKR && (
            <span style={{ fontSize: '18px', color: '#aaa', textDecoration: 'line-through' }}>
              Rs. {product.compareAtPriceLKR.toLocaleString()}
            </span>
          )}
          {product.compareAtPriceLKR > product.priceLKR && (
            <span className="badge px-2.5 py-1.5" style={{ background: '#e74c3c', color: '#fff', fontSize: '12px', borderRadius: '4px', fontWeight: 600 }}>
              Save Rs. {(product.compareAtPriceLKR - product.priceLKR).toLocaleString()}
            </span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Quantity:</span>
          <div className="qty-control">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!product.inStock}
              aria-label="Decrease quantity"
            >−</button>
            <input
              type="number"
              value={quantity}
              min={1}
              max={maxQty}
              onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              aria-label="Quantity"
            />
            <button
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              disabled={!product.inStock || quantity >= maxQty}
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        {/* Add to Cart & View Cart */}
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap flex-sm-nowrap" style={{ maxWidth: '450px' }}>
          <button
            className="btn btn-primary px-4 py-2.5 d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '15px',
              flex: 2,
              height: '48px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 14px rgba(0, 210, 106, 0.25)',
            }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            onMouseEnter={(e) => {
              if (product.inStock) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 210, 106, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 210, 106, 0.25)';
            }}
          >
            {product.inStock ? (
              <>
                <i className="fas fa-shopping-bag" style={{ fontSize: '15px' }}></i>
                Add to Cart
              </>
            ) : (
              'Out of Stock'
            )}
          </button>
          <Link
            href="/cart"
            className="btn btn-outline-primary px-4 py-2.5 d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: '30px',
              fontWeight: 600,
              fontSize: '15px',
              flex: 1.2,
              height: '48px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 124, 89, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <i className="fas fa-shopping-cart" style={{ fontSize: '15px' }}></i>
            View Cart
          </Link>
        </div>

        {/* Product Meta */}
        <div
          className="p-3 rounded"
          style={{ background: 'var(--light)', fontSize: '14px', lineHeight: 2 }}
        >
          <div><strong>Weight:</strong> {product.weightGrams}g per packet</div>
          {product.packetDimensions && (
            <div><strong>Dimensions:</strong> {product.packetDimensions}</div>
          )}
          <div><strong>Shelf Life:</strong> {product.shelfLife}</div>
          <div><strong>Payment:</strong> Cash on Delivery only</div>
          <div><strong>Delivery:</strong> 2–5 business days island-wide</div>
        </div>

        {/* Product Tabs */}
        <div className="mt-4">
          <div className="d-flex gap-0 mb-3" style={{ borderBottom: '2px solid var(--gray-200)' }}>
            {([
              { key: 'description', label: 'Description' },
              { key: 'ingredients', label: 'Ingredients' },
              { key: 'delivery', label: 'Delivery Info' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  fontWeight: activeTab === key ? 700 : 500,
                  color: activeTab === key ? 'var(--primary)' : '#666',
                  borderBottom: `3px solid ${activeTab === key ? 'var(--primary)' : 'transparent'}`,
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ padding: '16px 0', color: '#555', lineHeight: 1.8, fontSize: '14px' }}>
            {activeTab === 'description' && <p>{product.description}</p>}
            {activeTab === 'ingredients' && (
              <p><strong>Ingredients:</strong> {product.ingredients}</p>
            )}
            {activeTab === 'delivery' && (
              <div>
                <p>We offer <strong>Cash on Delivery</strong> island-wide across all 25 districts of Sri Lanka.</p>
                <ul>
                  <li>Delivery takes <strong>2–5 business days</strong> from order confirmation</li>
                  <li>Colombo: Rs. 250 | Western Province: Rs. 300 | Outstation: Rs. 400</li>
                  <li><strong>Free delivery</strong> on orders over Rs. 2,500</li>
                  <li>You only pay when your order arrives — no advance payment needed</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
