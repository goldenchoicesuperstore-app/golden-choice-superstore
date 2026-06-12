"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "../../../components/products/ProductCard";
import { getCategoryBySlug, CATEGORIES } from "../../../lib/data/categories";
import { useProducts } from "../../../hooks/useProducts";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const category = getCategoryBySlug(slug);
  const router = useRouter();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'best-selling'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStartEvent = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveEvent = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = CATEGORIES.findIndex(c => c.slug === slug);
    if (currentIndex === -1) return;

    if (isLeftSwipe && currentIndex < CATEGORIES.length - 1) {
      router.push(`/categories/${CATEGORIES[currentIndex + 1].slug}`);
    } else if (isRightSwipe && currentIndex > 0) {
      router.push(`/categories/${CATEGORIES[currentIndex - 1].slug}`);
    }
  };

  const { products, loading, loadingMore, error, hasMore, loadMore } = useProducts({
    categorySlug: slug,
    sortBy,
    inStockOnly
  });

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <Link href="/" className="text-brand-500 font-semibold hover:underline">Go back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-36 pt-[110px] px-4 md:px-8"
      onTouchStart={onTouchStartEvent}
      onTouchMove={onTouchMoveEvent}
      onTouchEnd={onTouchEndEvent}
    >
      <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-8 mb-6 bg-gradient-to-r from-[#FFE566] via-[#F5C200] to-[#C9980A] animate-shimmer shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-900/70 mb-4 flex items-center gap-2 font-medium">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-gray-900 font-bold">{category.name}</span>
          </nav>

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl drop-shadow-sm">{category.icon}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{category.name}</h1>
            </div>
            <p className="text-gray-900/90 font-medium max-w-2xl">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 font-semibold text-gray-800"
        >
          <span>Filters & Sort</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Filter Panel */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-fit`}>
          <div>
            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Sort By</h3>
            <div className="space-y-2">
              {[
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'best-selling', label: 'Best Selling' },
              ].map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input 
                    type="radio" 
                    name="sort" 
                    value={option.value} 
                    checked={sortBy === option.value}
                    onChange={() => setSortBy(option.value as any)}
                    className="text-brand-500 focus:ring-brand-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Filter</h3>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input 
                type="checkbox" 
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="text-brand-500 focus:ring-brand-500 rounded"
              />
              In Stock Only
            </label>
            
            <div className="mt-4">
              <span className="text-sm font-semibold text-gray-700 block mb-2">Price Range (₦)</span>
              <input type="range" className="w-full accent-brand-500" min="0" max="1000000" step="1000" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₦0</span>
                <span>₦1,000,000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">
              Failed to load products: {error.message}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse flex flex-col gap-3 h-64">
                  <div className="bg-gray-200 w-full h-32 rounded-lg"></div>
                  <div className="bg-gray-200 w-3/4 h-4 rounded"></div>
                  <div className="bg-gray-200 w-1/2 h-4 rounded mt-auto"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products in this category yet.</h3>
              <p className="text-gray-500">Check back soon! We're always adding new items.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-white border-2 border-brand-500 text-brand-600 font-bold py-2 px-8 rounded-full hover:bg-brand-50 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
