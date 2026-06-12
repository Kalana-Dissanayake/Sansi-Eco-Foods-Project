'use client';

import useSWR from 'swr';
import { getProducts, getProductBySlug } from '../lib/firestore';
import type { Product } from '../../shared/types';

export function useProducts(categoryId?: string) {
  const key = categoryId ? `products:${categoryId}` : 'products:all';
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    key,
    () => getProducts(categoryId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute cache
    }
  );

  return {
    products: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useProduct(slug: string) {
  const { data, error, isLoading } = useSWR<Product | null>(
    slug ? `product:${slug}` : null,
    () => getProductBySlug(slug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    product: data,
    isLoading,
    isError: !!error,
  };
}
