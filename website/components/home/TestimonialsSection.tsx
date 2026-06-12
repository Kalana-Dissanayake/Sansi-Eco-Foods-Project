'use client';

import { useEffect, useRef } from 'react';

const TESTIMONIALS = [
  {
    text: "Absolutely love the Mango Jujubes! So natural and delicious — my kids can't stop eating them. I'm so glad I found a brand that doesn't use any chemicals.",
    author: 'Nimesha P.',
    location: 'Colombo',
    rating: 5,
  },
  {
    text: "Best dehydrated fruits I've tried. Knowing there are zero chemicals makes me feel great about giving these to my family. The Papaya ones are amazing!",
    author: 'Rasika F.',
    location: 'Kandy',
    rating: 5,
  },
  {
    text: "Ordered twice already. Fast delivery and the packaging is so fresh. The Mixed Fruits pack is my favourite! Will definitely be a regular customer.",
    author: 'Sanduni M.',
    location: 'Gampaha',
    rating: 5,
  },
  {
    text: "Finally a healthy snack I can trust for my children. The Banana Coins are naturally sweet and the quality is outstanding. Highly recommend!",
    author: 'Priya T.',
    location: 'Negombo',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Owl Carousel after scripts load
    const init = () => {
      if (typeof window !== 'undefined' && (window as typeof window & { $?: (el: Element) => { owlCarousel: (opts: Record<string, unknown>) => void } }).$) {
        const $ = (window as typeof window & { $: (el: Element) => { owlCarousel: (opts: Record<string, unknown>) => void } }).$;
        if (carouselRef.current) {
          $(carouselRef.current).owlCarousel({
            autoplay: true,
            autoplayTimeout: 5000,
            loop: true,
            margin: 24,
            dots: true,
            nav: false,
            responsive: {
              0: { items: 1 },
              576: { items: 1 },
              768: { items: 2 },
              1200: { items: 3 },
            },
          });
        }
      }
    };

    // Wait for jQuery/Owl to be available
    const timer = setTimeout(init, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="section-padding" style={{ background: 'var(--light)' }}>
      <div className="container-fluid px-lg-5">
        <div className="section-header wow animate__fadeInUp" data-wow-delay="0.1s">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real reviews from happy snack lovers across Sri Lanka</p>
        </div>

        {/* Fallback grid for SSR / no-JS */}
        <div className="row g-4 d-none d-md-flex">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <div key={i} className="col-md-4">
              <TestimonialCard {...t} />
            </div>
          ))}
        </div>

        {/* Owl Carousel for mobile */}
        <div ref={carouselRef} className="owl-carousel d-md-none">
          {TESTIMONIALS.map((t, i) => (
            <div key={i}>
              <TestimonialCard {...t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  text,
  author,
  location,
  rating,
}: {
  text: string;
  author: string;
  location: string;
  rating: number;
}) {
  return (
    <div className="testimonial-item wow animate__fadeInUp" data-wow-delay="0.1s">
      <div className="stars">
        {Array.from({ length: rating }).map((_, i) => (
          <i key={i} className="fas fa-star"></i>
        ))}
      </div>
      <p>&ldquo;{text}&rdquo;</p>
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
          }}
        >
          {author[0]}
        </div>
        <div>
          <div className="reviewer">{author}</div>
          <div className="reviewer-location">{location}</div>
        </div>
      </div>
    </div>
  );
}
