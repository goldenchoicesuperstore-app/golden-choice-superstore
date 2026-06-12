"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "../../lib/data/categories";

export default function BottomNav() {
  const pathname = usePathname();

  const hiddenRoutes = ["/auth/login", "/auth/register", "/splash", "/checkout", "/checkout/success"];
  if (hiddenRoutes.some(route => pathname.startsWith(route)) || pathname === "/") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#F5C200] to-[#C9980A] z-50 shadow-[0_-4px_20px_rgba(201,152,10,0.15)] h-[84px] flex items-center pb-safe">
      <div className="flex overflow-x-auto hide-scrollbar px-2 gap-3 items-center w-full">
        {/* Home Link */}
        <Link 
          href="/categories/hair-products"
          className="flex flex-col items-center justify-center min-w-[72px] h-[68px] p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 text-white group shrink-0"
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 mb-1 drop-shadow-sm ${pathname === '/categories/hair-products' ? 'bg-white border-2 border-[#F5C200] text-[#C9980A]' : 'bg-white/20 group-hover:bg-white/30'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <span className={`text-[10px] font-bold text-center leading-tight whitespace-nowrap ${pathname === '/categories/hair-products' ? 'opacity-100' : 'opacity-90'}`}>Home</span>
        </Link>

        {/* Category Links */}
        {CATEGORIES.map((cat) => {
          const isActive = pathname === `/categories/${cat.slug}`;
          return (
            <Link 
              key={cat.slug} 
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center justify-center min-w-[72px] h-[68px] p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 text-white group shrink-0"
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
  );
}
