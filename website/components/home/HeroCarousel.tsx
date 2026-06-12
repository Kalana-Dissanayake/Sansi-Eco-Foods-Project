'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HeroSlide } from '../../../shared/types';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    imageUrl: '/images/hero-1.png',
    headline: "Sri Lanka's Finest Natural Fruit Snacks",
    subheadline: '100% Natural · No Chemicals · Handcrafted in Anamaduwa',
    cta1Label: 'Shop Now',
    cta1Href: '/products',
    cta2Label: 'Our Story',
    cta2Href: '/about',
  },
  {
    id: '2',
    imageUrl: '/images/hero-2.png',
    headline: '100% Natural · No Chemicals · Handcrafted',
    subheadline: 'Premium dehydrated fruit snacks delivered island-wide via Cash on Delivery',
    cta1Label: 'View Products',
    cta1Href: '/products',
    cta2Label: 'Contact Us',
    cta2Href: '/contact',
  },
];

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const displaySlides = slides?.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    // Bootstrap carousel is initialized by Bootstrap JS loaded via CDN
  }, []);

  return (
    <div
      id="heroCarousel"
      className="carousel slide hero-carousel"
      data-bs-ride="carousel"
      data-bs-interval="5000"
    >
      <div className="carousel-indicators">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-label={`Slide ${index + 1}`}
            style={{ backgroundColor: 'var(--secondary)', width: '10px', height: '10px', borderRadius: '50%' }}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {displaySlides.map((slide, index) => (
          <div key={slide.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <div className="carousel-overlay" aria-hidden="true" />
            <Image
              src={slide.imageUrl}
              alt={slide.headline}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
              sizes="100vw"
            />
            <div className="carousel-caption">
              <h1 className="animate__animated animate__fadeInDown">
                {slide.headline}
              </h1>
              {slide.subheadline && (
                <p className="animate__animated animate__fadeInUp">
                  {slide.subheadline}
                </p>
              )}
              <div className="d-flex gap-3 flex-wrap animate__animated animate__fadeInUp">
                <Link
                  href={slide.cta1Href}
                  className="btn btn-primary px-4 py-2"
                  style={{ borderRadius: '30px', fontWeight: 600 }}
                >
                  {slide.cta1Label}
                  <i className="fas fa-arrow-right ms-2"></i>
                </Link>
                <Link
                  href={slide.cta2Href}
                  className="btn btn-outline-light px-4 py-2"
                  style={{ borderRadius: '30px', fontWeight: 600 }}
                >
                  {slide.cta2Label}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true" />
        </span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span className="carousel-control-next-icon" aria-hidden="true" />
        </span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
