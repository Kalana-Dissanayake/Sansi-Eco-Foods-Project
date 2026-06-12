'use client';

import { useState } from 'react';
import type { Product, Category } from '../../../shared/types';
import ProductCard from './ProductCard';
import CategoryTabs from './CategoryTabs';
import Spinner from '../ui/Spinner';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  isLoading?: boolean;
}

export default function ProductGrid({
  products,
  categories,
  isLoading = false,
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === activeCategory);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner size="lg" />
        <p className="mt-3 text-muted">Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#ccc' }}></i>
          <p style={{ color: '#888', fontSize: '16px' }}>
            No products found in this category.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
              <ProductCard
                product={product}
                delay={`${0.05 + (index % 8) * 0.07}s`}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
