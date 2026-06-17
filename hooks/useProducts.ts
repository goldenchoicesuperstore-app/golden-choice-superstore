import { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, getDocs
} from 'firebase/firestore';
import { app } from '../lib/firebase/config';
import { Product } from '../types';

export interface UseProductsOptions {
  categorySlug?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'best-selling';
  inStockOnly?: boolean;
}

export const useProducts = (options?: UseProductsOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const db = getFirestore(app);

  const getQueryConstraints = () => {
    // Only fetch published products
    let constraints: any[] = [where('isPublished', '==', true)];

    if (options?.categorySlug) {
      constraints.push(where('category', '==', options.categorySlug));
    }
    if (options?.inStockOnly) {
      constraints.push(where('inStock', '==', true));
    }

    return constraints;
  };

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const constraints = getQueryConstraints();

        const q = query(collection(db, 'products'), ...constraints);
        const snapshot = await getDocs(q);

        let fetchedProducts: Product[] = [];
        snapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        // Client-side sorting
        fetchedProducts.sort((a, b) => {
          switch (options?.sortBy) {
            case 'price-asc':
              return (a.price || 0) - (b.price || 0);
            case 'price-desc':
              return (b.price || 0) - (a.price || 0);
            case 'best-selling':
              const aSales = a.soldCount ?? (a as any).sales ?? 0;
              const bSales = b.soldCount ?? (b as any).sales ?? 0;
              return bSales - aSales;
            case 'newest':
            default:
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return timeB - timeA;
          }
        });

        setProducts(fetchedProducts);
        setHasMore(false);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, [options?.categorySlug, options?.sortBy, options?.inStockOnly]);

  const loadMore = async () => {
    // No-op since we fetched all products
  };

  return { products, loading, loadingMore, error, hasMore, loadMore };
};
