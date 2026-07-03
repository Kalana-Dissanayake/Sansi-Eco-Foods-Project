'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Product, Category } from '../../../shared/types';
import ProductCard from './ProductCard';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const maxProductPrice = products.length > 0 ? Math.max(...products.map((p) => p.priceLKR)) : 1000;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Sync category parameter from URL with state
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryParam]);

  // Trigger smooth filter transition whenever filter values change
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  // Reset filters helper
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(maxProductPrice);
    setInStockOnly(false);
    router.push('/products');
  };

  // Calculate product count per category dynamically
  const getProductCountByCategory = (categoryId: string) => {
    if (categoryId === 'all') return products.length;
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  // Filtering Logic
  const filteredProducts = products.filter((product) => {
    // 1. Search Query
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(query);
      const descMatch = product.description.toLowerCase().includes(query);
      const tagMatch = product.healthTags?.some((t) => t.toLowerCase().includes(query)) ?? false;
      if (!nameMatch && !descMatch && !tagMatch) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
      return false;
    }

    // 3. Price Filter
    if (product.priceLKR < minPrice || product.priceLKR > maxPrice) {
      return false;
    }

    // 4. Stock Availability Filter
    if (inStockOnly && !product.inStock) {
      return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.priceLKR - b.priceLKR;
      case 'price-desc':
        return b.priceLKR - a.priceLKR;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
    }
  });

  const activeFiltersCount = [
    searchTerm !== '',
    selectedCategory !== 'all',
    minPrice > 0 || maxPrice < maxProductPrice,
    inStockOnly,
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner size="lg" />
        <p className="mt-3 text-muted">Loading products...</p>
      </div>
    );
  }

  const renderFilterContent = () => (
    <>
      {/* Search Input */}
      <div className="position-relative mb-4">
        <label className="form-label fw-bold mb-2" style={{ fontSize: '14px' }}>Search</label>
        <div className="position-relative">
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderRadius: '8px', fontSize: '14px' }}
          />
          <i
            className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
            style={{ pointerEvents: 'none', fontSize: '14px' }}
          ></i>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-4">
        <label className="form-label fw-bold mb-2" style={{ fontSize: '14px' }}>
          Category
        </label>
        <div className="d-flex flex-column gap-2">
          <div className="category-checkbox-item">
            <input
              type="radio"
              name="categoryFilter"
              id="cat-all"
              className="category-radio-input d-none"
              checked={selectedCategory === 'all'}
              onChange={() => {
                setSelectedCategory('all');
                router.push('/products');
              }}
            />
            <label
              htmlFor="cat-all"
              className={`category-checkbox-label d-flex align-items-center justify-content-between p-2.5 rounded cursor-pointer ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              <span>All Categories</span>
              <span className="badge bg-light text-dark border">{products.length}</span>
            </label>
          </div>
          {categories.map((cat) => {
            const count = getProductCountByCategory(cat.id);
            const isSelected = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="category-checkbox-item">
                <input
                  type="radio"
                  name="categoryFilter"
                  id={`cat-${cat.id}`}
                  className="category-radio-input d-none"
                  checked={isSelected}
                  onChange={() => {
                    setSelectedCategory(cat.id);
                    router.push(`/products?category=${cat.id}`);
                  }}
                />
                <label
                  htmlFor={`cat-${cat.id}`}
                  className={`category-checkbox-label d-flex align-items-center justify-content-between p-2.5 rounded cursor-pointer ${isSelected ? 'active' : ''}`}
                >
                  <span>{cat.name}</span>
                  <span className="badge bg-light text-dark border">{count}</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider & Inputs */}
      <div className="mb-4">
        <label className="form-label fw-bold mb-2" style={{ fontSize: '14px' }}>Price Range</label>
        <div className="px-1">
          <input
            type="range"
            className="form-range"
            min={0}
            max={maxProductPrice}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ accentColor: 'var(--primary)' }}
          />
          <div className="d-flex align-items-center justify-content-between mt-2 gap-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light" style={{ fontSize: '11px', padding: '4px 6px' }}>Min</span>
              <input
                type="number"
                className="form-control px-2"
                value={minPrice}
                onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                style={{ fontSize: '12px' }}
              />
            </div>
            <span className="text-muted" style={{ fontSize: '12px' }}>–</span>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light" style={{ fontSize: '11px', padding: '4px 6px' }}>Max</span>
              <input
                type="number"
                className="form-control px-2"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                style={{ fontSize: '12px' }}
              />
            </div>
          </div>
          <div className="text-muted mt-2 text-center" style={{ fontSize: '12.5px', fontWeight: 500 }}>
            Rs. {minPrice.toLocaleString()} – Rs. {maxPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="mb-4">
        <label className="form-label fw-bold mb-2" style={{ fontSize: '14px' }}>Availability</label>
        <div className="form-check d-flex align-items-center gap-2">
          <input
            className="form-check-input mt-0 cursor-pointer"
            type="checkbox"
            id="inStockCheck"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label
            className="form-check-label cursor-pointer"
            htmlFor="inStockCheck"
            style={{ fontSize: '14px', userSelect: 'none' }}
          >
            In Stock Only
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="btn btn-outline-secondary w-100 btn-sm mt-2 d-flex align-items-center justify-content-center gap-2"
          style={{ borderRadius: '8px', fontSize: '13px', padding: '6px' }}
        >
          <i className="fas fa-undo-alt"></i>Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <div className="container-fluid px-0">
      {/* Mobile Top Bar (filters toggle + sort) */}
      <div className="d-flex d-lg-none justify-content-between align-items-center mb-4 gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="btn btn-primary d-flex align-items-center gap-2 px-3.5 py-2"
          style={{ borderRadius: '30px', fontSize: '14px', fontWeight: 600 }}
        >
          <i className="fas fa-filter"></i>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span
              className="badge bg-white text-primary rounded-circle ms-1 d-flex align-items-center justify-content-center"
              style={{
                fontSize: '11px',
                width: '18px',
                height: '18px',
                fontWeight: 'bold',
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="d-flex align-items-center gap-2">
          <label htmlFor="sortByMobile" className="mb-0 text-muted" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
            Sort By:
          </label>
          <select
            id="sortByMobile"
            className="form-select form-select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ borderRadius: '8px', minWidth: '140px', fontSize: '13px', padding: '6px 24px 6px 12px' }}
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Alphabetical: A-Z</option>
            <option value="name-desc">Alphabetical: Z-A</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Desktop Sidebar */}
        <aside className="col-lg-3 d-none d-lg-block">
          <div
            className="p-4 bg-white border"
            style={{
              boxShadow: 'var(--shadow-sm)',
              borderColor: 'var(--gray-200)',
              borderRadius: 'var(--border-radius)',
              position: 'sticky',
              top: '90px',
              zIndex: 10,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
              <h4 className="m-0" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Filters
              </h4>
              <i className="fas fa-sliders-h text-muted"></i>
            </div>
            {renderFilterContent()}
          </div>
        </aside>

        {/* Right Side: Product Grid */}
        <main className="col-lg-9">
          {/* Desktop Top Bar info + sorting */}
          <div className="d-none d-lg-flex justify-content-between align-items-center mb-4">
            <p className="text-muted m-0" style={{ fontSize: '14.5px' }}>
              Showing <strong>{sortedProducts.length}</strong> of <strong>{products.length}</strong> products
            </p>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sortByDesktop" className="mb-0 text-muted" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                Sort By:
              </label>
              <select
                id="sortByDesktop"
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ borderRadius: '8px', minWidth: '180px', fontSize: '14px', padding: '8px 12px' }}
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
                <option value="name-desc">Alphabetical: Z-A</option>
              </select>
            </div>
          </div>

          {/* Desktop active filter tags */}
          {activeFiltersCount > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
              <span className="text-muted" style={{ fontSize: '13px' }}>Active filters:</span>
              {searchTerm && (
                <span
                  className="badge bg-light text-dark border d-flex align-items-center gap-2 py-1.5 px-2.5 cursor-pointer"
                  style={{ borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}
                  onClick={() => setSearchTerm('')}
                >
                  Search: "{searchTerm}"
                  <i className="fas fa-times-circle text-muted"></i>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span
                  className="badge bg-light text-dark border d-flex align-items-center gap-2 py-1.5 px-2.5 cursor-pointer"
                  style={{ borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}
                  onClick={() => {
                    setSelectedCategory('all');
                    router.push('/products');
                  }}
                >
                  Category: {categories.find((c) => c.id === selectedCategory)?.name}
                  <i className="fas fa-times-circle text-muted"></i>
                </span>
              )}
              {(minPrice > 0 || maxPrice < maxProductPrice) && (
                <span
                  className="badge bg-light text-dark border d-flex align-items-center gap-2 py-1.5 px-2.5 cursor-pointer"
                  style={{ borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(maxProductPrice);
                  }}
                >
                  Price: Rs. {minPrice} - Rs. {maxPrice}
                  <i className="fas fa-times-circle text-muted"></i>
                </span>
              )}
              {inStockOnly && (
                <span
                  className="badge bg-light text-dark border d-flex align-items-center gap-2 py-1.5 px-2.5 cursor-pointer"
                  style={{ borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}
                  onClick={() => setInStockOnly(false)}
                >
                  In Stock Only
                  <i className="fas fa-times-circle text-muted"></i>
                </span>
              )}
            </div>
          )}

          {/* Product cards list */}
          <div
            style={{
              opacity: isFiltering ? 0 : 1,
              transform: isFiltering ? 'scale(0.98)' : 'scale(1)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
          {sortedProducts.length === 0 ? (
            <div
              className="text-center py-5 bg-white border"
              style={{
                borderColor: 'var(--gray-200)',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
              <p className="text-muted mb-3" style={{ fontSize: '16px' }}>
                No products found matching the criteria.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: '30px', fontWeight: 600 }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {sortedProducts.map((product, index) => (
                <div key={product.id} className="col-xl-4 col-md-6">
                  <ProductCard
                    product={product}
                    delay={`${0.1 + (index % 6) * 0.1}s`}
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Mobile offcanvas overlay & drawer */}
      {isMobileFilterOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1060,
              backdropFilter: 'blur(2px)',
              transition: 'opacity 0.2s ease',
            }}
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          <div
            className="position-fixed top-0 start-0 h-100 bg-white p-4 filter-drawer-open"
            style={{
              width: '85%',
              maxWidth: '320px',
              zIndex: 1070,
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
              <h4 className="m-0" style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Filters
              </h4>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
            <div style={{ flex: 1 }}>
              {renderFilterContent()}
            </div>
            <div className="border-top pt-3 mt-4">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn btn-primary w-100 py-2.5"
                style={{ borderRadius: '30px', fontWeight: 700 }}
              >
                Show {sortedProducts.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
