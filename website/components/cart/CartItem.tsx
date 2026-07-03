'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import type { CartItem as CartItemType } from '../../../shared/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeFromCart(item.productId);
    }, 300);
  };

  return (
    <tr className={`cart-item-row ${isRemoving ? 'removing-item' : ''}`}>
      {/* Product */}
      <td>
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: '70px',
              height: '70px',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'var(--light)',
              flexShrink: 0,
            }}
          >
            <Image
              src={item.image || '/images/products/placeholder.png'}
              alt={item.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="70px"
            />
          </div>
          <div>
            <Link
              href={`/products/${item.slug}`}
              style={{ fontWeight: 600, color: 'var(--dark)', textDecoration: 'none', fontSize: '15px' }}
            >
              {item.name}
            </Link>
            <div style={{ fontSize: '13px', color: '#888' }}>Rs. {item.priceLKR.toLocaleString()} each</div>
          </div>
        </div>
      </td>

      {/* Unit Price */}
      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
        Rs. {item.priceLKR.toLocaleString()}
      </td>

      {/* Quantity */}
      <td>
        <div className="qty-control">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            value={item.quantity}
            min={1}
            max={item.maxQuantity}
            onChange={(e) =>
              updateQuantity(item.productId, Math.min(item.maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))
            }
            aria-label={`Quantity of ${item.name}`}
          />
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.maxQuantity}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </td>

      {/* Subtotal */}
      <td style={{ fontWeight: 700, color: 'var(--dark)' }}>
        Rs. {(item.priceLKR * item.quantity).toLocaleString()}
      </td>

      {/* Remove */}
      <td>
        <button
          onClick={handleRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#dc3545',
            fontSize: '18px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background 0.2s',
          }}
          aria-label={`Remove ${item.name} from cart`}
          title="Remove item"
        >
          <i className="fas fa-times"></i>
        </button>
      </td>
    </tr>
  );
}
