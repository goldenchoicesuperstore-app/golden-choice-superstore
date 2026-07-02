"use client";

import Image from "next/image";
import { Product } from "../../types";
import { useCartStore } from "../../store/cartStore";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState(false);

  const handleAskAi = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAiModalOpen(true);
    
    if (aiResponse) return; // already fetched

    setAiLoading(true);
    setAiError(false);
    
    try {
      const res = await fetch('/api/product-ai-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          brand: product.brand,
          description: product.description,
          imageUrl: product.imageUrl
        })
      });
      
      if (!res.ok) throw new Error("API failed");
      
      const data = await res.json();
      setAiResponse(data.summary);
    } catch (err) {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: 1,
      maxQuantity: product.stockQuantity || 10,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-brand transition-shadow duration-300 relative group min-w-[160px] md:min-w-0 h-full">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
          -{discountPercentage}%
        </div>
      )}
      
      {/* Wishlist Icon */}
      <button 
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full z-10 text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${isWishlisted ? 'text-red-500' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </button>

      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-50 p-2">
        <Image 
          src={product.imageUrl || "https://placehold.co/400x400/eeeeee/cccccc?text=Product"} 
          alt={product.name}
          fill
          unoptimized
          className="object-contain p-2 mix-blend-multiply"
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
        
        <button 
          onClick={handleAskAi}
          className="text-[11px] bg-gradient-to-r from-[#F5C200]/10 to-white text-[#C9980A] border border-[#F5C200]/30 hover:bg-[#F5C200]/10 rounded-md py-1 px-2 font-bold transition-colors flex items-center justify-center gap-1 mb-2 w-fit shadow-sm"
        >
          ✨ Ask AI about this product
        </button>
        
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">
              ₦{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₦{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-brand-500 to-[#C9980A] text-white hover:shadow-brand hover:scale-[1.02] border-none font-semibold text-sm py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAiModalOpen(false); }}>
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#F5C200]/30 relative cursor-default"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F5C200] to-[#C9980A] p-4 flex items-center justify-between">
              <h4 className="text-white font-bold flex items-center gap-2">
                <span>✨</span> AI Product Info
              </h4>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAiModalOpen(false); }}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-8 h-8 border-4 border-[#F5C200] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-gray-600">Analyzing product...</p>
                </div>
              ) : aiError ? (
                <div className="text-center py-4">
                  <p className="text-red-500 font-medium text-sm">Unable to load product info right now. Please try again.</p>
                </div>
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed font-medium">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
