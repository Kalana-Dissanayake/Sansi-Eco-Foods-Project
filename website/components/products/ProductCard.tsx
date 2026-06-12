'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import type { Product } from '../../../shared/types';

interface ProductCardProps {
  product: Product;
  delay?: string;
}

// Pixel event helpers (safe to call even without pixel configured)
function trackAddToCart(product: Product) {
  try {
    if (typeof window !== 'undefined') {
      // Meta Pixel
      if ((window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq) {
        (window as typeof window & { fbq: (...args: unknown[]) => void }).fbq('track', 'AddToCart', {
          content_ids: [product.id],
          content_name: product.name,
          currency: 'LKR',
          value: product.priceLKR,
        });
      }
      // TikTok Pixel
      if ((window as typeof window & { ttq?: { track: (...args: unknown[]) => void } }).ttq) {
        (window as typeof window & { ttq: { track: (...args: unknown[]) => void } }).ttq.track('AddToCart', {
          content_id: product.id,
          content_name: product.name,
          currency: 'LKR',
          value: product.priceLKR,
        });
      }
    }
  } catch {
    // Pixel not available
  }
}

export default function ProductCard({ product, delay = '0.1s' }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, 1);
    trackAddToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });
  };

  const isLowStock =
    product.inStock &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.lowStockThreshold;

  return (
    <div
      className={`product-item h-100 wow animate__fadeInUp ${!product.inStock ? 'out-of-stock' : ''}`}
      data-wow-delay={delay}
    >
      {/* Image */}
      <div className="product-img">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <Image
            src={product.images[0] ?? '/images/products/placeholder.png'}
            alt={`${product.name} ${product.weightGrams}g packet - Sansi Eco Foods Sri Lanka`}
            fill
            sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        </Link>

        {/* Badges */}
        <div className="product-badges">
          {!product.inStock && <span className="badge-out-of-stock">Out of Stock</span>}
          {isLowStock && <span className="badge-low-stock">Only {product.stockQuantity} left!</span>}
          {product.inStock && !isLowStock && product.stockQuantity > 0 && (
            <span className="badge-new">New</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name">
          <Link
            href={`/products/${product.slug}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {product.name}
          </Link>
        </h3>

        {/* Health Tags */}
        {product.healthTags && product.healthTags.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {product.healthTags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge-natural">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="product-price">
          <span className="price-current">Rs. {product.priceLKR.toLocaleString()}</span>
          {product.compareAtPriceLKR > product.priceLKR && (
            <span className="price-compare">Rs. {product.compareAtPriceLKR.toLocaleString()}</span>
          )}
        </div>

        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
          {product.weightGrams}g · Shelf Life: {product.shelfLife}
        </p>

        {/* Actions */}
        <div className="product-actions">
          <Link
            href={`/products/${product.slug}`}
            className="btn btn-outline-primary"
          >
            View Detail
          </Link>
          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.inStock ? (
              <>
                <i className="fas fa-shopping-bag me-1"></i>
                Add to Cart
              </>
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
