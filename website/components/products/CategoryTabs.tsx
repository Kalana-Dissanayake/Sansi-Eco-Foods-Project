'use client';

import type { Product } from '../../../shared/types';

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
      <button
        onClick={() => onSelect('all')}
        className={`btn px-4 py-2 ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
        style={{ borderRadius: '30px', fontWeight: 500, fontSize: '14px', transition: 'all 0.3s' }}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`btn px-4 py-2 ${activeCategory === cat.id ? 'btn-primary' : 'btn-outline-primary'}`}
          style={{ borderRadius: '30px', fontWeight: 500, fontSize: '14px', transition: 'all 0.3s' }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
