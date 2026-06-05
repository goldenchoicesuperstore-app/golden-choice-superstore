"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../../../store/cartStore";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { Product } from "../../../types";
import ProductCard from "../../../components/products/ProductCard";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const addItem = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const db = getFirestore(app);
        const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedProduct = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
          setProduct(fetchedProduct);
          
          // Fetch related products
          if (fetchedProduct.category) {
            const relatedQ = query(
              collection(db, "products"), 
              where("category", "==", fetchedProduct.category),
              limit(7)
            );
            const relatedSnap = await getDocs(relatedQ);
            const related = relatedSnap.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .filter(p => p.id !== fetchedProduct.id)
              .slice(0, 6);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-[110px] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-[110px] flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link href="/home" className="text-brand-500 font-bold hover:underline">Go back to Home</Link>
      </div>
    );
  }

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: quantity,
      maxQuantity: product.stockQuantity || 10,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product.stockQuantity || 10)) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-[110px] px-4 md:px-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/home" className="hover:text-brand-500">Home</Link>
        <span>&gt;</span>
        <Link href={`/categories/${product.category}`} className="hover:text-brand-500 capitalize">{product.category.replace("-", " ")}</Link>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col md:flex-row gap-8 lg:gap-12 mb-12">
        {/* Product Image */}
        <div className="w-full md:w-1/2 relative">
          <div className="aspect-square bg-gray-50 rounded-xl relative overflow-hidden p-4 border border-gray-100 flex items-center justify-center">
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-md z-10">
                -{discountPercentage}%
              </div>
            )}
            <Image 
              src={product.imageUrl || "https://placehold.co/800x800/eeeeee/cccccc?text=Product"}
              alt={product.name}
              fill
              unoptimized
              className="object-contain mix-blend-multiply p-4"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
          <p className="text-lg text-brand-600 font-bold mb-4">{product.brand}</p>
          
          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-black text-brand-500">₦{product.price.toLocaleString()}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xl text-gray-400 line-through mb-1">₦{product.compareAtPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="mb-6">
            {product.inStock && product.stockQuantity > 5 ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> In Stock
              </span>
            ) : product.inStock && product.stockQuantity > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Only {product.stockQuantity} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Out of Stock
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Quantity */}
          <div className="mb-8">
            <span className="block text-sm font-bold text-gray-700 mb-2">Quantity</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={quantity <= 1}
                  className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 font-bold text-lg"
                >-</button>
                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stockQuantity || 10)}
                  className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 font-bold text-lg"
                >+</button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto">
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-brand-500 text-white hover:bg-brand-600 font-bold text-lg py-4 rounded-xl shadow-brand hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Add to Cart
            </button>
            <button 
              disabled={!product.inStock}
              className="w-full bg-white text-brand-600 border-2 border-brand-500 hover:bg-brand-50 font-bold text-lg py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 border-b-4 border-brand-500 pb-2 inline-block mb-6">Product Details</h2>
        <div className="prose max-w-none text-gray-600">
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p>No detailed description available for this product.</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 border-b-4 border-brand-500 pb-1 inline-block">You May Also Like</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar md:grid md:grid-cols-6 md:gap-4 md:overflow-visible">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="snap-start w-[160px] md:w-auto shrink-0">
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        </section>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
