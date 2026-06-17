import type { Metadata } from 'next';
import Link from 'next/link';
import HeroCarousel from '../components/home/HeroCarousel';
import AboutSnippet from '../components/home/AboutSnippet';
import FeaturesSection from '../components/home/FeaturesSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { getSettings, getFeaturedProducts, getProducts } from '../lib/firestore';

export const metadata: Metadata = {
  title: 'Sansi Eco Foods – Natural Dehydrated Fruit Snacks | Sri Lanka',
  description:
    'Shop premium 100% natural dehydrated fruit snacks from Anamaduwa, Sri Lanka. Mango Jujubes, Papaya, Banana Coins & more. No chemicals. Island-wide Cash on Delivery.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSettings();
  let featuredProducts = settings?.featuredProductIds
    ? await getFeaturedProducts(settings.featuredProductIds)
    : [];

  if (featuredProducts.length === 0) {
    const allProducts = await getProducts();
    featuredProducts = allProducts.slice(0, 4);
  }

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel slides={settings?.heroSlides ?? []} />

      {/* About Snippet */}
      <AboutSnippet />

      {/* Features Strip */}
      <FeaturesSection />

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* CTA Banner */}
      <section className="section-padding cta-banner">
        <div className="container-fluid px-lg-5 text-center position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <h2
                className="mb-3 wow animate__fadeInDown"
                data-wow-delay="0.1s"
                style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: 'clamp(24px, 4vw, 40px)' }}
              >
                Order Fresh, Natural Snacks — Delivered to Your Door
              </h2>
              <p
                className="mb-4 wow animate__fadeInUp"
                data-wow-delay="0.2s"
                style={{ color: 'rgba(255,255,255,0.88)', fontSize: '17px' }}
              >
                Cash on Delivery available island-wide. No advance payment required.
                Just order and we&apos;ll bring nature&apos;s goodness to your doorstep.
              </p>
              <Link
                href="/products"
                className="btn btn-secondary px-5 py-2 wow animate__fadeInUp"
                data-wow-delay="0.3s"
                style={{ borderRadius: '30px', fontWeight: 700, fontSize: '16px' }}
              >
                Shop Now <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* WhatsApp floating button */}
      {settings?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            background: '#25D366',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '28px',
            boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
            zIndex: 9999,
            transition: 'transform 0.2s, box-shadow 0.2s',
            textDecoration: 'none',
          }}
          className="whatsapp-fab"
        >
          <i className="fab fa-whatsapp"></i>
        </a>
      )}
    </>
  );
}
