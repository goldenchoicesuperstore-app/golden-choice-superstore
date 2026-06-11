"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "../../store/cartStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCartStore();

  const hiddenRoutes = ["/auth/login", "/auth/register", "/splash", "/checkout", "/checkout/success"];
  if (hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  // The prompt says: "This replaces the category bar on non-home pages — the category bar only shows on the home page."
  // If we shouldn't show BottomNav on home page, we return null here. 
  // However, usually mobile apps have a global bottom nav AND a horizontal category bar above it on the home page.
  // I will hide it on home page to perfectly match "replaces category bar on non-home pages" meaning they are mutually exclusive.
  if (pathname === "/") {
    return null; 
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-brand-500 z-50 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.08)] h-[76px] flex items-center justify-around px-2 pb-safe">
      <Link href="/" className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${pathname === '/' ? 'text-brand-500' : 'text-gray-400 hover:text-brand-500'}`}>
        {pathname === '/' && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full" />}
        <svg xmlns="http://www.w3.org/2000/svg" fill={pathname === '/' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1 mt-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span className="text-[10px] font-bold text-center leading-tight">Home</span>
      </Link>
      
      <Link href="/categories" className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${pathname.startsWith('/categories') ? 'text-brand-500' : 'text-gray-400 hover:text-brand-500'}`}>
        {pathname.startsWith('/categories') && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full" />}
        <svg xmlns="http://www.w3.org/2000/svg" fill={pathname.startsWith('/categories') ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1 mt-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        <span className="text-[10px] font-bold text-center leading-tight">Categories</span>
      </Link>

      <Link href="/cart" className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${pathname === '/cart' ? 'text-brand-500' : 'text-gray-400 hover:text-brand-500'}`}>
        {pathname === '/cart' && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full" />}
        <div className="relative mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill={pathname === '/cart' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-center leading-tight">Cart</span>
      </Link>

      <Link href="/account" className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${pathname.startsWith('/account') ? 'text-brand-500' : 'text-gray-400 hover:text-brand-500'}`}>
        {pathname.startsWith('/account') && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full" />}
        <svg xmlns="http://www.w3.org/2000/svg" fill={pathname.startsWith('/account') ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1 mt-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <span className="text-[10px] font-bold text-center leading-tight">Account</span>
      </Link>
    </nav>
  );
}
