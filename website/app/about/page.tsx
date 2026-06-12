import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us – Our Story | Sansi Eco Foods Sri Lanka',
  description:
    'Learn about Sansi Eco Foods — a family business in Anamaduwa, Sri Lanka crafting 100% natural dehydrated fruit snacks with no chemicals and no preservatives.',
};

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid px-lg-5 position-relative">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">About Us</li>
            </ol>
          </nav>
          <h1 className="display-6 fw-bold" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            About Us
          </h1>
        </div>
      </div>

      {/* Brand Story */}
      <section className="section-padding">
        <div className="container-fluid px-lg-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 wow animate__fadeInLeft" data-wow-delay="0.1s">
              <div className="about-img">
                <Image
                  src="/images/about-hero.png"
                  alt="Sansi Eco Foods natural dehydrated fruit production workshop in Anamaduwa Sri Lanka"
                  width={580}
                  height={460}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  className="rounded"
                />
              </div>
            </div>
            <div className="col-lg-6 wow animate__fadeInRight" data-wow-delay="0.2s">
              <span className="d-inline-block mb-2 px-3 py-1 rounded-pill" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>
                🌿 Our Story
              </span>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                From Anamaduwa&apos;s Orchards to Your Table
              </h2>
              <p className="mb-3" style={{ lineHeight: 1.9, color: '#555' }}>
                Nestled in the lush agricultural heartland of Anamaduwa in Sri Lanka&apos;s North Western
                Province, Sansi Eco Foods was born from a deep-rooted love for the island&apos;s bountiful
                tropical fruits and an unwavering commitment to truly natural, healthy snacking.
              </p>
              <p className="mb-4" style={{ lineHeight: 1.9, color: '#555' }}>
                Our founders grew up surrounded by orchards of mangoes, papayas, bananas, and cashews.
                Inspired by traditional preservation methods passed down through generations, they combined
                ancestral wisdom with modern food safety practices to create a range of dehydrated fruit
                snacks that are as pure as nature intended — <strong>zero chemicals, zero artificial
                preservatives, zero compromise</strong>.
              </p>
              <ul className="list-unstyled mb-4">
                {[
                  'Founded with a mission to bring 100% natural snacks to Sri Lankan homes',
                  'Chemical-free production from harvest to packaging',
                  'Supporting local fruit farmers across Sri Lanka',
                ].map((point, i) => (
                  <li key={i} className="d-flex align-items-start mb-3">
                    <span className="me-3 mt-1 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '24px', height: '24px', minWidth: '24px', background: 'var(--primary)', color: '#fff', fontSize: '12px' }}>
                      <i className="fas fa-check"></i>
                    </span>
                    <span style={{ color: '#555', lineHeight: 1.6 }}>{point}</span>
                  </li>
                ))}
              </ul>
              <Link href="/products" className="btn btn-primary px-4 py-2" style={{ borderRadius: '30px', fontWeight: 600 }}>
                Explore Our Products <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Our Firm Banner */}
      <section className="section-padding cta-banner">
        <div className="container-fluid px-lg-5 text-center position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <h2 className="mb-3 wow animate__fadeInDown" data-wow-delay="0.1s" style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: 'clamp(24px, 4vw, 40px)' }}>
                Experience Our Natural Production Process
              </h2>
              <p className="mb-4 wow animate__fadeInUp" data-wow-delay="0.2s" style={{ color: 'rgba(255,255,255,0.88)', fontSize: '17px' }}>
                We welcome visitors to our Anamaduwa facility to see firsthand how we craft our fruit
                snacks with care and 100% natural ingredients.
              </p>
              <Link href="/contact" className="btn btn-secondary px-5 py-2 wow animate__fadeInUp" data-wow-delay="0.3s" style={{ borderRadius: '30px', fontWeight: 700 }}>
                Contact Us to Visit <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding" style={{ background: 'var(--light)' }}>
        <div className="container-fluid px-lg-5">
          <div className="section-header">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The principles that guide everything we do</p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'fa-leaf', title: 'Natural First', desc: 'Every ingredient we use is 100% natural. We never compromise on this principle — not for cost, not for convenience. From sourcing to packaging, natural is our standard.' },
              { icon: 'fa-award', title: 'Quality Guaranteed', desc: 'Each batch is carefully inspected and tested to ensure you receive only the finest dehydrated fruits. If it\'s not perfect, it doesn\'t leave our facility.' },
              { icon: 'fa-hands-helping', title: 'Community Rooted', desc: 'We partner directly with local farmers, supporting Sri Lanka\'s agricultural community and ensuring the freshest possible fruits while contributing to rural livelihoods.' },
            ].map((value, i) => (
              <div key={i} className="col-md-4 wow animate__fadeInUp" data-wow-delay={`${0.1 + i * 0.15}s`}>
                <div className="feature-item h-100">
                  <div className="feature-icon">
                    <i className={`fas ${value.icon}`}></i>
                  </div>
                  <h5 className="mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{value.title}</h5>
                  <p style={{ color: '#666', lineHeight: 1.8, fontSize: '15px' }}>{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It's Made */}
      <section className="section-padding">
        <div className="container-fluid px-lg-5">
          <div className="section-header">
            <h2 className="section-title">How We Make Our Fruit Snacks</h2>
            <p className="section-subtitle">A simple, natural process — no shortcuts, no chemicals</p>
          </div>
          <div className="row g-4">
            {[
              { num: 1, icon: 'fa-seedling', title: 'Source', desc: 'Fresh tropical fruits are hand-picked from trusted local Sri Lankan farmers at peak ripeness for maximum natural sweetness and flavour.' },
              { num: 2, icon: 'fa-cut', title: 'Prepare', desc: 'Fruits are carefully washed, peeled, and sliced using hygienic methods. Only quality pieces make it to the next stage — imperfect pieces are composted.' },
              { num: 3, icon: 'fa-temperature-low', title: 'Dehydrate', desc: 'Using controlled low-heat dehydration, moisture is gently removed over many hours, preserving colour, nutrients, and authentic flavour without any additives.' },
              { num: 4, icon: 'fa-box', title: 'Pack & Deliver', desc: 'Finished products are carefully weighed, packaged in fresh kraft pouches, and dispatched island-wide via our Cash on Delivery network within 1-2 business days.' },
            ].map((step, i) => (
              <div key={i} className="col-xl-3 col-lg-6 col-md-6 wow animate__fadeInUp" data-wow-delay={`${0.1 + i * 0.15}s`}>
                <div className="step-card">
                  <div className="step-number">{step.num}</div>
                  <div className="feature-icon mx-auto mb-3">
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>{step.title}</h5>
                  <p style={{ color: '#666', lineHeight: 1.8, fontSize: '14px' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Production Image */}
      <section className="section-padding-sm" style={{ background: 'var(--light)' }}>
        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <Image
                src="/images/about-production.png"
                alt="Sansi Eco Foods dehydrated fruit production process - natural and chemical-free"
                width={900}
                height={500}
                style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '16px' }}
                className="shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
