import Image from 'next/image';
import Link from 'next/link';

export default function AboutSnippet() {
  return (
    <section className="section-padding" style={{ background: '#fff' }}>
      <div className="container-fluid px-lg-5">
        <div className="row g-5 align-items-center">
          {/* Image Column */}
          <div className="col-lg-6 wow animate__fadeInLeft" data-wow-delay="0.1s">
            <div className="about-img">
              <Image
                src="/images/about-hero.png"
                alt="Sansi Eco Foods natural dehydrated fruit production in Anamaduwa, Sri Lanka"
                width={580}
                height={440}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                className="rounded"
              />
            </div>
          </div>

          {/* Text Column */}
          <div className="col-lg-6 wow animate__fadeInRight" data-wow-delay="0.2s">
            <div className="ps-lg-3">
              <span
                className="d-inline-block mb-2 px-3 py-1 rounded-pill"
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
              >
                🌿 About Us
              </span>
              <h2 className="mb-4">
                Best Natural Dehydrated Fruit Snacks in Sri Lanka
              </h2>
              <p className="mb-4" style={{ lineHeight: 1.9, color: '#555' }}>
                Nestled in the heart of Anamaduwa, North Western Province, Sansi Eco Foods was
                born from a deep love for Sri Lanka&apos;s bountiful tropical fruits and a
                commitment to healthy, chemical-free snacking. We use traditional dehydration
                techniques to preserve the authentic flavour and natural goodness of every fruit —
                with no additives, no preservatives, and absolutely no chemicals.
              </p>

              <ul className="list-unstyled mb-4">
                {[
                  '100% Natural ingredients — no chemicals, no preservatives',
                  'Handcrafted in Anamaduwa, North Western Province',
                  'Island-wide Cash on Delivery delivery',
                ].map((point, i) => (
                  <li key={i} className="d-flex align-items-start mb-3">
                    <span
                      className="me-3 mt-1 d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: '24px',
                        height: '24px',
                        minWidth: '24px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    >
                      <i className="fas fa-check"></i>
                    </span>
                    <span style={{ color: '#555', lineHeight: 1.6 }}>{point}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/about"
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: '30px', fontWeight: 600 }}
              >
                Read Our Story <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
