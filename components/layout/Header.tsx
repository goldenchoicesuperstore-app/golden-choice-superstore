"use client";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "../../store/cartStore";
import { AuthContext } from "../../lib/auth/AuthContext";

export default function Header() {
  const { itemCount } = useCartStore();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const pathname = usePathname();
  const router = useRouter();

  const hiddenRoutes = ["/", "/splash"];
  if (hiddenRoutes.includes(pathname) || pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query?.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-white z-50 shadow-sm px-4 py-3 flex flex-col gap-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gradient-to-r after:from-[#F5C200] after:to-[#C9980A]">
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
  );
}
