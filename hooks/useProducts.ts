import { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, DocumentData
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
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const db = getFirestore(app);
  const PAGE_LIMIT = 24;

  const getQueryConstraints = () => {
    // Only fetch published products
    let constraints: any[] = [where('isPublished', '==', true)];

    if (options?.categorySlug) {
      constraints.push(where('category', '==', options.categorySlug));
    }
    if (options?.inStockOnly) {
      constraints.push(where('inStock', '==', true));
    }

    switch (options?.sortBy) {
      case 'price-asc':
        constraints.push(orderBy('price', 'asc'));
        break;
      case 'price-desc':
        constraints.push(orderBy('price', 'desc'));
        break;
      case 'best-selling':
        constraints.push(orderBy('soldCount', 'desc'));
        break;
      case 'newest':
      default:
        constraints.push(orderBy('createdAt', 'desc'));
        break;
    }

    return constraints;
  };

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const constraints = getQueryConstraints();
        constraints.push(limit(PAGE_LIMIT));

        const q = query(collection(db, 'products'), ...constraints);
        const snapshot = await getDocs(q);

        const fetchedProducts: Product[] = [];
        snapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        setProducts(fetchedProducts);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_LIMIT);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, [options?.categorySlug, options?.sortBy, options?.inStockOnly]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);
      const constraints = getQueryConstraints();
      constraints.push(startAfter(lastDoc));
      constraints.push(limit(PAGE_LIMIT));

      const q = query(collection(db, 'products'), ...constraints);
      const snapshot = await getDocs(q);

      const fetchedProducts: Product[] = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });

      setProducts(prev => [...prev, ...fetchedProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_LIMIT);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoadingMore(false);
    }
  };

  return { products, loading, loadingMore, error, hasMore, loadMore };
};
