"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/products/ProductCard";
import Skeleton from "../../components/ui/Skeleton";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);

  const { products, loading } = useProducts();
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
    (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <header className="sticky top-0 left-0 right-0 bg-white z-40 shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <form onSubmit={handleSearch} className="flex-grow relative">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..." 
            className="w-full bg-gray-100 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-2.5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </form>
      </header>

      <main className="p-4">
        {query ? (
          <h1 className="text-lg font-bold text-gray-900 mb-4">
            {filteredProducts.length} results for "{query}"
          </h1>
        ) : (
          <h1 className="text-lg font-bold text-gray-900 mb-4">Search Products</h1>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="flex flex-col gap-2">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No results found</h2>
            <p className="text-gray-500 mb-6">We couldn't find anything matching "{query}".</p>
            <div className="text-left max-w-sm mx-auto bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-3">Try these suggestions:</h3>
              <ul className="list-disc pl-5 text-gray-600 flex flex-col gap-1">
                <li>Check your spelling</li>
                <li>Use more general terms</li>
                <li>Try different keywords</li>
              </ul>
            </div>
            <Link href="/" className="mt-8 inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium">
              Go back home
            </Link>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Start typing to search for products.
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
