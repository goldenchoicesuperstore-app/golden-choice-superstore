"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "../store/cartStore";
import { AuthContext } from "../lib/auth/AuthContext";


export default function HomePage() {
  const { itemCount } = useCartStore();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const pathname = usePathname();
  const router = useRouter();



  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { bg: "bg-gradient-to-r from-[#FFE566] to-[#F5C200]", text: "text-gray-900", title: "Welcome to Golden Choice Superstore", sub: "Your trusted store for everyday essentials", btnText: "Start Shopping", link: "/categories/hair-products" },
    { bg: "bg-brand-500", text: "text-white", title: "Fresh Deals Every Day", sub: "Up to 50% off on groceries", btnText: "Shop Now", link: "/products" },
    { bg: "bg-gradient-to-r from-[#FFE566] via-[#F5C200] to-[#C9980A] animate-shimmer", text: "text-gray-900", title: "Upgrade Your Gadgets Today", sub: "", btnText: "Shop Now", link: "/products" },
    { bg: "bg-white", text: "text-gray-900", title: "Baby Essentials", sub: "Everything your little one needs", btnText: "Shop Now", link: "/products" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query?.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-36">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm px-4 py-3 flex flex-col gap-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gradient-to-r after:from-[#F5C200] after:to-[#C9980A]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-extrabold text-xl text-[#F5C200] tracking-tight">Golden Choice</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <Link href={user ? "/account" : "/auth/login"} className="text-gray-600 hover:text-brand-500">
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
      <div className="pt-[110px] min-h-screen flex flex-col pb-8 px-4 md:px-8">
        {/* Hero Carousel */}
        <section className="relative w-full flex-grow max-h-[700px] min-h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out flex flex-col items-center text-center justify-center px-6 md:px-16 ${slide.bg} ${slide.text}`}
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-sm">{slide.title}</h2>
              {slide.sub && <p className="mb-8 text-lg md:text-xl font-medium opacity-90 max-w-2xl">{slide.sub}</p>}
              <button 
                onClick={() => router.push(slide.link)}
                className={`w-fit px-8 py-3 font-bold rounded-full text-base shadow-md transition-all duration-300 hover:shadow-brand hover:scale-105 ${slide.bg === 'bg-white' ? 'bg-gradient-to-r from-brand-500 to-[#C9980A] text-white' : slide.bg.includes('animate-shimmer') || slide.bg.includes('from-[#FFE566]') ? 'bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white' : 'bg-white text-gray-900'}`}
              >
                {slide.btnText}
              </button>
            </div>
          ))}
          {/* Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
            {slides.map((_, i) => {
              const activeColor = slides[currentSlide].text === 'text-white' ? 'bg-white' : 'bg-gray-900';
              const inactiveColor = slides[currentSlide].text === 'text-white' ? 'bg-white/50' : 'bg-gray-900/30';
              return (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2.5 rounded-full transition-all ${i === currentSlide ? `${activeColor} w-8` : `${inactiveColor} w-2.5`}`}
                />
              );
            })}
          </div>
        </section>
      </div>



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
