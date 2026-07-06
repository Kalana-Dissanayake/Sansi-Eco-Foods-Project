import Image from 'next/image';
import SectionHeader from '../ui/SectionHeader';

const FEATURES = [
  {
    image: '/images/Natural-Process.jpg',
    alt: 'Sansi Eco Foods workers handling freshly dehydrated fruit slices',
    title: '100% Natural Process',
    description:
      'Every product is crafted using only fresh fruits and sugar — zero chemicals, zero artificial preservatives, zero compromise on your health.',
  },
  {
    image: '/images/Premium-Fruits.jpg',
    alt: 'Premium fresh tropical fruits sourced from Sri Lankan farmers',
    title: 'Premium Sri Lankan Fruits',
    description:
      "Sourced from trusted local farmers across Sri Lanka's fruit-growing regions for maximum freshness and authentic tropical flavour.",
  },
  {
    image: '/images/Healthy-for-family.jpg',
    alt: 'Happy family enjoying healthy snacks together',
    title: 'Safe for the Whole Family',
    description:
      'Our dehydration process retains natural nutrients while ensuring long shelf life — healthy snacking for children and adults alike.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="section-padding" style={{ background: 'var(--light)' }}>
      <div className="container-fluid px-lg-5">
        <SectionHeader
          title="Why Choose Sansi Eco Foods?"
          subtitle="Nature's goodness, preserved the right way."
        />
        <div className="row g-4">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="col-md-4 wow animate__fadeInUp"
              data-wow-delay={`${0.1 + index * 0.15}s`}
            >
              <div className="feature-item h-100">
                <div className="feature-img-wrap">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={480}
                    height={300}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="feature-img"
                  />
                  <div className="feature-img-overlay" aria-hidden="true" />
                </div>
                <div className="feature-body">
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
