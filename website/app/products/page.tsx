import type { Metadata } from 'next';
import { getProducts, getCategories } from '../../lib/firestore';
import ProductGrid from '../../components/products/ProductGrid';
import SectionHeader from '../../components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Our Products – Natural Dehydrated Fruits | Sansi Eco Foods Sri Lanka',
  description:
    'Browse our full range of 100% natural dehydrated fruit snacks. Mango Jujubes, Papaya Jujubes, Banana Coins, Mixed Fruits & more. Cash on Delivery island-wide.',
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid px-lg-5 position-relative">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Products
              </li>
            </ol>
          </nav>
          <h1 className="display-6 fw-bold" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Our Products
          </h1>
        </div>
      </div>

      {/* Products Section */}
      <section className="section-padding">
        <div className="container-fluid px-lg-5">
          <SectionHeader
            title="Our Products"
            subtitle="100% Natural · No Chemicals · Handcrafted in Sri Lanka"
          />
          <ProductGrid products={products} categories={categories} />
        </div>
      </section>
    </>
  );
}
