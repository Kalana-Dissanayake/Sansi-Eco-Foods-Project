'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to cart updates for badge animation
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    };
    window.addEventListener('cart:updated', handleCartUpdate);
    return () => window.removeEventListener('cart:updated', handleCartUpdate);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light py-3 py-lg-0 px-lg-5 sticky-top ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{
        background: '#fff',
        boxShadow: scrolled ? '0 2px 20px rgba(74,124,89,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s ease',
        zIndex: 1050,
      }}
    >
      <Link href="/" className="navbar-brand d-flex align-items-center">
        <img
          src="/images/sansi-logo.png"
          alt="Sansi Eco Foods Logo"
          style={{ height: '40px', marginRight: '10px' }}
        />
        <h1 className="m-0" style={{
          fontFamily: 'var(--font-open-sans), sans-serif',
          fontWeight: 800,
          fontSize: '22px',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ color: '#ff6a00' }}>SANSI</span>
          <span style={{ color: '#00d26a' }}>ECO</span>
          <span style={{
            background: 'linear-gradient(to right, #ff6a00, #00d26a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>FOODS</span>
        </h1>
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarCollapse"
        aria-controls="navbarCollapse"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarCollapse">
        <ul className="navbar-nav ms-auto py-0">
          {[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About Us' },
            { href: '/products', label: 'Products' },
            { href: '/contact', label: 'Contact Us' },
          ].map(({ href, label }) => (
            <li key={href} className="nav-item">
              <Link
                href={href}
                className={`nav-link px-3 ${isActive(href) ? 'active' : ''}`}
                style={{ fontWeight: isActive(href) ? 600 : 500 }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="d-flex align-items-center ms-3 gap-2">
          {/* Cart */}
          <Link
            href="/cart"
            className="position-relative"
            aria-label={`Shopping cart with ${itemCount} items`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '42px',
                height: '42px',
                transform: cartBump ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <i className="fas fa-shopping-bag" style={{ fontSize: '14px' }}></i>
            </div>
            {itemCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{
                  backgroundColor: 'var(--secondary)',
                  fontSize: '10px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
