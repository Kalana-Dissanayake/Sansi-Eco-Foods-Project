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
  const { user, customer, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic categories hover list
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Close user dropdown when path changes
  useEffect(() => {
    setIsUserDropdownOpen(false);
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isUserDropdownOpen]);

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

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light py-3 py-lg-3 px-lg-5 sticky-top ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{
        background: '#fff',
        boxShadow: scrolled ? '0 2px 20px rgba(74,124,89,0.12)' : '0 2px 16px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s ease',
        zIndex: 1050,
      }}
    >
      <Link href="/" onClick={() => setIsOpen(false)} className="navbar-brand d-flex align-items-center">
        <img
          src="/images/sansi-logo.png"
          alt="Sansi Eco Foods Logo"
          style={{ height: '46px', marginRight: '12px' }}
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
                className={`nav-link px-3 py-2 ${isActive(href) ? 'active' : ''}`}
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
              className={`nav-link px-3 py-2 d-flex align-items-center gap-1 ${isActive('/products') ? 'active' : ''}`}
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
                className={`nav-link px-3 py-2 ${isActive(href) ? 'active' : ''}`}
                style={{ fontWeight: isActive(href) ? 600 : 500 }}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* User Dropdown or Sign In */}
          {user ? (
            <li
              className="nav-item dropdown user-dropdown-container"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                }}
                className="nav-link px-3 d-flex align-items-center gap-1 border-0 bg-transparent w-100 text-start"
                style={{
                  fontWeight: 500,
                  color: 'var(--dark)',
                  outline: 'none',
                  boxShadow: 'none',
                  cursor: 'pointer'
                }}
                aria-expanded={isUserDropdownOpen}
              >
                <span className="text-truncate">Hello, {customer?.name ? customer.name.split(' ')[0] : 'Customer'}</span>
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
                    transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <ul
                className={`dropdown-menu user-dropdown-menu border-0 shadow-sm ${isUserDropdownOpen ? 'show' : ''}`}
                style={{
                  borderRadius: '8px',
                  padding: '8px 0',
                }}
              >
                <li>
                  <Link
                    href="/dashboard"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsOpen(false);
                    }}
                    className="dropdown-item py-2 px-4"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsOpen(false);
                      signOut();
                    }}
                    className="dropdown-item py-2 px-4 border-0 bg-transparent w-100 text-start text-danger"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </li>
          ) : (
            <li className="nav-item">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`nav-link px-3 py-2 ${isActive('/login') ? 'active' : ''}`}
                style={{ fontWeight: isActive('/login') ? 600 : 500 }}
              >
                Sign In
              </Link>
            </li>
          )}
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
              className={`btn btn-primary rounded-circle d-flex align-items-center justify-content-center ${cartBump ? 'cart-bump-animation' : ''}`}
              style={{
                width: '42px',
                height: '42px',
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
