import Link from 'next/link';
import ProductCard from '../products/ProductCard';
import SectionHeader from '../ui/SectionHeader';
import type { Product } from '../../../shared/types';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="section-padding" style={{ background: '#fff' }}>
      <div className="container-fluid px-lg-5">
        <SectionHeader
          title="Our Featured Products"
          subtitle="Taste nature's goodness in every bite."
        />

        {products.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ color: '#888' }}>
              Products coming soon. Check back shortly!
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product, index) => (
              <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                <ProductCard
                  product={product}
                  delay={`${0.1 + index * 0.1}s`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5">
          <Link
            href="/products"
            className="btn btn-primary px-5 py-2 featured-cta-btn"
            style={{ borderRadius: '30px', fontWeight: 600 }}
          >
            View All Products <i className="fas fa-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
