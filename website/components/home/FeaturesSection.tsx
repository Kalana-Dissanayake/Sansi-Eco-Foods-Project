import SectionHeader from '../ui/SectionHeader';

const FEATURES = [
  {
    icon: 'fa-leaf',
    title: '100% Natural Process',
    description:
      'Every product is crafted using only fresh fruits and sugar — zero chemicals, zero artificial preservatives, zero compromise on your health.',
  },
  {
    icon: 'fa-star',
    title: 'Premium Sri Lankan Fruits',
    description:
      "Sourced from trusted local farmers across Sri Lanka's fruit-growing regions for maximum freshness and authentic tropical flavour.",
  },
  {
    icon: 'fa-heart',
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
                <div className="feature-icon">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h5 className="mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {feature.title}
                </h5>
                <p style={{ color: '#666', lineHeight: 1.8, fontSize: '15px' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
