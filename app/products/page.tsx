"use client";

import { useSearchParams } from "next/navigation";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/products/ProductCard";
import Skeleton from "../../components/ui/Skeleton";
import { Suspense } from "react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const isFeatured = searchParams.get("featured") === "true";
  
  const { products, loading } = useProducts();
  
  const displayProducts = isFeatured 
    ? (products || []).filter(p => p.isFeatured)
    : products || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          {isFeatured ? "Featured Products" : "All Products"}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))
          ) : displayProducts.length > 0 ? (
            displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold bg-white rounded-2xl shadow-sm border border-gray-100">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
