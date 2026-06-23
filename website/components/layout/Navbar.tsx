'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getCategories } from '../../lib/firestore';
import type { Category } from '../../../shared/types';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic categories hover list
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // Fetch categories on mount
  useEffect(() => {
    let active = true;
    getCategories().then((data) => {
      if (active) setCategories(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const primaryLinks = [
    { href: '/', label: 'Home' },
  ];

  const secondaryLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ];

  if (user) {
    secondaryLinks.push({ href: '/dashboard', label: 'Dashboard' });
  } else {
    secondaryLinks.push({ href: '/login', label: 'Sign In' });
  }

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
      <Link href="/" onClick={() => setIsOpen(false)} className="navbar-brand d-flex align-items-center">
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
        onClick={() => setIsOpen(!isOpen)}
        aria-controls="navbarCollapse"
        aria-expanded={isOpen}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarCollapse">
        <ul className="navbar-nav ms-auto py-0">
          {primaryLinks.map(({ href, label }) => (
            <li key={href} className="nav-item">
              <Link
                href={href}
                onClick={() => setIsOpen(false)}
                className={`nav-link px-3 ${isActive(href) ? 'active' : ''}`}
                style={{ fontWeight: isActive(href) ? 600 : 500 }}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Products Dropdown Nav Item */}
          <li
            className="nav-item dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <Link
              href="/products"
              onClick={(e) => {
                if (window.innerWidth < 992) {
                  e.preventDefault();
                  setIsDropdownOpen(!isDropdownOpen);
                } else {
                  setIsOpen(false);
                }
              }}
              className={`nav-link px-3 d-flex align-items-center gap-1 ${isActive('/products') ? 'active' : ''}`}
              style={{ fontWeight: isActive('/products') ? 600 : 500 }}
            >
              Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 0.25s ease',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Link>
            <ul
              className={`dropdown-menu border-0 shadow-sm ${isDropdownOpen ? 'show' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '8px 0',
              }}
            >
              <li>
                <Link
                  href="/products"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsOpen(false);
                  }}
                  className="dropdown-item py-2 px-4"
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsOpen(false);
                    }}
                    className="dropdown-item py-2 px-4"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {secondaryLinks.map(({ href, label }) => (
            <li key={href} className="nav-item">
              <Link
                href={href}
                onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
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
                className="position-absolute badge rounded-pill"
                style={{
                  backgroundColor: 'var(--secondary)',
                  fontSize: '10px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  top: '0px',
                  right: '-6px',
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
