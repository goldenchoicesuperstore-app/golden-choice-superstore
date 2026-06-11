"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "../store/cartStore";
import { AuthContext } from "../lib/auth/AuthContext";
import ProductCard from "../components/products/ProductCard";
import Skeleton from "../components/ui/Skeleton";
import { useProducts } from "../hooks/useProducts";

const categories = [
  { name: "Hair Products", slug: "hair-products", icon: "✂️" },
  { name: "Electronics", slug: "electronics", icon: "⚡" },
  { name: "Baby Products", slug: "baby-products", icon: "👶" },
  { name: "Insecticides", slug: "insecticides", icon: "🛡️" },
  { name: "Perfumes", slug: "perfumes", icon: "✨" },
  { name: "Phones", slug: "phones", icon: "📱" },
  { name: "Laptops", slug: "laptops", icon: "💻" },
  { name: "Beddings", slug: "beddings", icon: "🛏️" },
  { name: "Drinks", slug: "drinks", icon: "☕" },
];

export default function HomePage() {
  const { itemCount } = useCartStore();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const pathname = usePathname();
  const router = useRouter();

  const { products, loading } = useProducts();

  const featuredProducts = (products || []).filter(p => p.isFeatured);
  const dealsProducts = (products || []).filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
  const newArrivals = [...(products || [])].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { bg: "bg-brand-500", text: "text-white", title: "Fresh Deals Every Day", sub: "Up to 50% off on groceries" },
    { bg: "bg-gray-900", text: "text-white", title: "Tech Week is Here", sub: "Upgrade your gadgets today" },
    { bg: "bg-white", text: "text-gray-900", title: "Baby Essentials", sub: "Everything your little one needs" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Countdown timer state for deals
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query?.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const renderProductSkeletons = (count: number = 4) => {
    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className="snap-start w-[160px] md:w-auto shrink-0 flex flex-col gap-2">
        <Skeleton className="w-full aspect-square rounded-xl" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>
    ));
  };

  return (
    <div className="bg-white min-h-screen pb-28">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm px-4 py-3 flex flex-col gap-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gradient-to-r after:from-[#F5C200] after:to-[#C9980A]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-500">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">Golden Choice</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <Link href={user ? "/profile" : "/login"} className="text-gray-600 hover:text-brand-500">
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-brand-200" unoptimized />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative text-gray-600 hover:text-brand-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            name="q"
            placeholder="Search for products, brands..." 
            className="w-full bg-gray-100 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white border border-transparent transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-2.5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </form>
      </header>

      {/* Main Content Padding for Fixed Header */}
      <div className="pt-[110px]">
        {/* Hero Carousel */}
        <section className="relative w-full h-48 sm:h-64 overflow-hidden mt-2">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out flex flex-col justify-center px-6 ${slide.bg} ${slide.text}`}
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <h2 className="text-3xl font-extrabold mb-2">{slide.title}</h2>
              <p className="mb-4 opacity-90">{slide.sub}</p>
              <button className={`w-fit px-6 py-2 font-bold rounded-full text-sm shadow-sm transition-all duration-300 hover:shadow-brand hover:scale-105 ${slide.bg === 'bg-white' ? 'bg-gradient-to-r from-brand-500 to-[#C9980A] text-white' : 'bg-white text-gray-900'}`}>
                Shop Now
              </button>
            </div>
          ))}
          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 border-b-4 border-brand-500 pb-1 inline-block">Featured Products</h2>
            <Link href="/products?featured=true" className="text-sm font-semibold text-brand-600">See All</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
            {loading ? renderProductSkeletons(4) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <div key={product.id} className="snap-start w-[160px] md:w-auto shrink-0">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-6 text-gray-500 col-span-4 bg-gray-50 rounded-xl">
                No featured products found.
              </div>
            )}
          </div>
        </section>

        {/* Deals Section */}
        <section className="mt-8 px-4 bg-red-50 py-6 rounded-xl mx-2 shadow-sm border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">Today's Deals</h2>
            {/* Timer */}
            <div className="flex items-center gap-1 text-sm font-bold bg-white px-2 py-1 rounded shadow-sm text-red-600">
              <span className="bg-red-100 px-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>:
              <span className="bg-red-100 px-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>:
              <span className="bg-red-100 px-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
            {loading ? renderProductSkeletons(4) : dealsProducts.length > 0 ? (
              dealsProducts.slice(0, 4).map(product => (
                <div key={product.id} className="snap-start w-[160px] md:w-auto shrink-0">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-6 text-gray-500 col-span-4 bg-white/50 rounded-xl">
                No deals available today.
              </div>
            )}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mt-8 px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 border-b-4 border-brand-500 pb-1 inline-block">New Arrivals</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
            {loading ? renderProductSkeletons(4) : newArrivals.length > 0 ? (
              newArrivals.map(product => (
                <div key={product.id} className="snap-start w-[160px] md:w-auto shrink-0">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-6 text-gray-500 col-span-4 bg-gray-50 rounded-xl">
                No new arrivals yet.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Category Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#F5C200] to-[#C9980A] z-50 shadow-[0_-4px_20px_rgba(201,152,10,0.15)] h-[84px] flex items-center">
        <div className="flex overflow-x-auto hide-scrollbar px-2 gap-3 items-center w-full">
          {categories.map((cat) => {
            const isActive = pathname === `/categories/${cat.slug}`;
            return (
              <Link 
                key={cat.slug} 
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center justify-center min-w-[72px] h-[68px] p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 text-white group"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 mb-1 drop-shadow-sm ${isActive ? 'bg-white border-2 border-[#F5C200] text-[#C9980A]' : 'bg-white/20 group-hover:bg-white/30'}`}>
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <span className={`text-[10px] font-bold text-center leading-tight whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-90'}`}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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
