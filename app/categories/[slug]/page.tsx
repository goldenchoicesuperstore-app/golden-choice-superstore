"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "../../../components/products/ProductCard";
import { getCategoryBySlug, CATEGORIES } from "../../../lib/data/categories";
import { useProducts } from "../../../hooks/useProducts";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const category = getCategoryBySlug(slug);
  const router = useRouter();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  useEffect(() => {
    if (slug !== 'hair-products') return;

    window.history.pushState({ goodbyeTrap: true }, '');

    const handlePopState = () => {
      setShowGoodbye(true);
      window.history.pushState({ goodbyeTrap: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [slug]);
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
      className="min-h-screen bg-gray-50 pb-36 px-4 md:px-8"
      onTouchStart={onTouchStartEvent}
      onTouchMove={onTouchMoveEvent}
      onTouchEnd={onTouchEndEvent}
    >
      {showGoodbye && (
        <div className="fixed inset-0 z-[99999] bg-gradient-to-r from-[#FFE566] to-[#F5C200] flex flex-col items-center justify-center p-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-8 drop-shadow-sm">
            Goodbye! Hope to see you again soon
          </h1>
          <button 
            onClick={() => setShowGoodbye(false)}
            className="bg-white text-gray-900 font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Continue Shopping
          </button>
        </div>
      )}
      {slug === 'hair-products' ? (
        <div className="-mx-4 md:-mx-8 mb-6">
          <div className="py-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-900/70 mb-4 flex items-center gap-2 font-medium px-4 md:px-8">
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <span>&gt;</span>
              <span className="text-gray-900 font-bold">{category.name}</span>
            </nav>
            
            <div className="relative w-full overflow-hidden shadow-sm">
              <img 
                src="https://i.postimg.cc/4x73MK63/Chat-GPT-Image-Jun-20-2026-04-18-00-PM.png" 
                alt="Hair Products"
                className="w-full h-full max-h-[180px] md:max-h-[280px] object-cover object-center block"
              />
              {/* Invisible clickable overlay for the 'Shop Now' button */}
              <div 
                onClick={() => {
                  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute cursor-pointer"
                style={{
                  top: '60%',
                  left: '15%',
                  width: '25%',
                  height: '25%',
                  zIndex: 10,
                  backgroundColor: 'transparent'
                }}
                title="Shop Now"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-8 mb-6 bg-gradient-to-r from-[#FFE566] via-[#F5C200] to-[#C9980A] animate-shimmer shadow-sm relative overflow-hidden">
          {/* Glow Pulse Overlay */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 245, 180, 0.4) 0%, transparent 70%)'
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-900/70 mb-4 flex items-center gap-2 font-medium">
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <span>&gt;</span>
              <span className="text-gray-900 font-bold">{category.name}</span>
            </nav>

            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.span 
                    className="text-4xl drop-shadow-sm inline-block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {category.icon}
                  </motion.span>
                  <motion.h1 
                    className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text"
                    style={{ 
                      backgroundImage: 'linear-gradient(90deg, #111827 0%, #111827 40%, #F5C200 48%, #FFFFFF 50%, #F5C200 52%, #111827 60%, #111827 100%)',
                      backgroundSize: '300% auto' 
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, backgroundPosition: ['200% center', '-100% center'] }}
                    transition={{
                      opacity: { duration: 0.5 },
                      y: { duration: 0.5 },
                      backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    {category.name}
                  </motion.h1>
                </div>
                <motion.p 
                  className="text-gray-900/90 font-medium max-w-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {category.description}
                </motion.p>
              </div>
              {(slug === 'electronics' || slug === 'phones') && (
                <motion.div
                  className="text-white font-bold text-lg md:text-xl flex items-center gap-2 w-fit shrink-0"
                  initial={{ opacity: 0, scale: 2.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 20px rgba(255,255,255,1)", "0px 0px 0px rgba(255,255,255,0)"]
                  }}
                  transition={{
                    opacity: { delay: 1, duration: 0.2 },
                    scale: { delay: 1, type: "spring", stiffness: 300, damping: 15 },
                    textShadow: { delay: 1.5, duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <motion.span 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="inline-block text-2xl"
                  >
                    ✨
                  </motion.span>
                  <span>Buy Now, Pay Back Monthly for 6 Months! 💳</span>
                  <motion.span 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="inline-block text-2xl"
                  >
                    ✨
                  </motion.span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 font-semibold text-gray-800"
        >
          <span>Sort</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Filter Panel */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-fit`}>
          <div>
            <h3 className="font-bold text-[#F5C200] mb-3 border-b border-[#F5C200] pb-2">Sort By</h3>
            <div className="space-y-2">
              {[
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'best-selling', label: 'Best Selling' },
              ].map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm text-[#C9980A]">
                  <input 
                    type="radio" 
                    name="sort" 
                    value={option.value} 
                    checked={sortBy === option.value}
                    onChange={() => setSortBy(option.value as any)}
                    className="accent-[#F5C200] text-[#F5C200] focus:ring-[#F5C200]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>


        </aside>

        {/* Product Grid */}
        <div className="flex-grow" id="product-grid">
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
              <div className="text-6xl mb-4 bg-[#F5C200]/20 w-24 h-24 rounded-full flex items-center justify-center">🛒</div>
              <h3 className="text-xl font-bold text-[#C9980A] mb-2">No products in this category yet.</h3>
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
