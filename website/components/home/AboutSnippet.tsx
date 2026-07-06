import Image from 'next/image';
import Link from 'next/link';

const BULLETS = [
  {
    icon: 'fa-seedling',
    text: '100% Natural ingredients — no chemicals, no preservatives',
  },
  {
    icon: 'fa-map-marker-alt',
    text: 'Handcrafted in Anamaduwa, North Western Province',
  },
  {
    icon: 'fa-motorcycle',
    text: 'Island-wide Cash on Delivery delivery',
  },
];

export default function AboutSnippet() {
  return (
    <section
      className="section-padding about-section"
      style={{ background: 'var(--about-bg)', overflow: 'hidden', position: 'relative' }}
    >
      {/* Decorative blobs */}
      <div className="about-bg-blob about-bg-blob--tl" aria-hidden="true" />
      <div className="about-bg-blob about-bg-blob--br" aria-hidden="true" />

      <div className="container-fluid px-lg-5" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row g-5 align-items-center">

          {/* ── Image Grid Column (left) ── */}
          <div className="col-lg-6 wow animate__fadeInLeft" data-wow-delay="0.1s">
            <div className="about-img-grid">

              {/* img1 — large, spans full height on left */}
              <div className="about-img-grid__large">
                <Image
                  src="/images/About-us-img1.png"
                  alt="Sansi Eco Foods artisans handcrafting dehydrated fruit snacks in Anamaduwa"
                  fill
                  sizes="(max-width: 991px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className="about-grid-img"
                  priority
                />
              </div>

              {/* Right column: img2 (top) + img3 (bottom) */}
              <div className="about-img-grid__col">
                <div className="about-img-grid__small">
                  <Image
                    src="/images/About-us-img2.jpg"
                    alt="Colourful assorted dehydrated tropical fruit mix"
                    fill
                    sizes="(max-width: 991px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className="about-grid-img wow animate__fadeInDown"
                    data-wow-delay="0.25s"
                  />
                </div>
                <div className="about-img-grid__small">
                  <Image
                    src="/images/About-us-img3.jpg"
                    alt="Fresh tropical fruits arranged beautifully on a platter"
                    fill
                    sizes="(max-width: 991px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className="about-grid-img wow animate__fadeInUp"
                    data-wow-delay="0.35s"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ── Text Column (right) ── */}
          <div className="col-lg-6 wow animate__fadeInRight" data-wow-delay="0.2s">
            <div className="ps-lg-3">
              <span
                className="d-inline-block mb-2 px-3 py-1 rounded-pill"
                style={{
                  background: 'rgba(74,124,89,0.12)',
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

              <p className="mb-4" style={{ lineHeight: 1.9, color: '#4a5568' }}>
                Nestled in the heart of Anamaduwa, North Western Province, Sansi Eco Foods was
                born from a deep love for Sri Lanka&apos;s bountiful tropical fruits and a
                commitment to healthy, chemical-free snacking. We use traditional dehydration
                techniques to preserve the authentic flavour and natural goodness of every fruit —
                with no additives, no preservatives, and absolutely no chemicals.
              </p>

              <ul className="list-unstyled mb-4">
                {BULLETS.map((item, i) => (
                  <li key={i} className="about-bullet">
                    <span className="about-bullet__icon">
                      <i className={`fas ${item.icon}`}></i>
                    </span>
                    <span className="about-bullet__text">{item.text}</span>
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
