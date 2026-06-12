import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductsByCategory, getProducts } from '../../../lib/firestore';
import ProductDetailView from '../../../components/products/ProductDetailView';
import ProductCard from '../../../components/products/ProductCard';
import SectionHeader from '../../../components/ui/SectionHeader';

interface ProductPageProps {
  params: { slug: string };
}

// Generate static params for all active products at build time
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product Not Found | Sansi Eco Foods' };
  }
  return {
    title: `${product.name} – 100% Natural | Sansi Eco Foods Sri Lanka`,
    description: `${product.description.slice(0, 150)}... Shop online with Cash on Delivery island-wide.`,
    openGraph: {
      title: `${product.name} – Sansi Eco Foods`,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getProductsByCategory(product.categoryId, product.id);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container-fluid px-lg-5 position-relative">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item"><a href="/products">Products</a></li>
              <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
            </ol>
          </nav>
          <h1 className="display-6 fw-bold" style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 3vw, 32px)' }}>
            {product.name}
          </h1>
        </div>
      </div>

      {/* Product Detail */}
      <section className="section-padding">
        <div className="container-fluid px-lg-5">
          <ProductDetailView product={product} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding-sm" style={{ background: 'var(--light)' }}>
          <div className="container-fluid px-lg-5">
            <SectionHeader
              title="You May Also Like"
              subtitle="More natural goodness from our collection"
            />
            <div className="row g-4">
              {relatedProducts.map((rp, index) => (
                <div key={rp.id} className="col-xl-3 col-lg-4 col-md-6">
                  <ProductCard product={rp} delay={`${0.1 + index * 0.1}s`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
