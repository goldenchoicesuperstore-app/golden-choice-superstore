"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { ToastProvider } from "../../components/ui/Toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  useEffect(() => {
    console.log("Admin Layout Guard - Auth State:", { loading, user, role: user?.role });
    if (!loading) {
      if (!user) {
        console.log("Admin Layout - No user found, redirecting to login");
        router.replace("/auth/login");
      } else if (user.role !== "admin") {
        console.log("Admin Layout - User is not admin, redirecting to 403");
        router.replace("/403");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const adminName = user.displayName || "Admin";

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Products", href: "/admin/products", icon: "📦" },
    { name: "Orders", href: "/admin/orders", icon: "🛒" },
    { name: "Customers", href: "/admin/customers", icon: "👥" },
    { name: "Categories", href: "/admin/categories", icon: "📁" },
    { name: "Coupons", href: "/admin/coupons", icon: "🏷️" },
    { name: "Chat Support", href: "/admin/chat", icon: "💬" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1A1A1A] text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-8 border-b border-gray-800">
          <h1 className="text-2xl font-black text-brand-500 flex items-center gap-2">
            <span className="text-3xl">⭐</span> Golden Choice
          </h1>
          <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-2 pl-10">Admin Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map(item => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${isActive ? 'bg-brand-500 text-gray-900 shadow-brand' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <span className="text-2xl">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="relative bg-white h-24 border-b border-gray-200 flex items-center justify-between px-10 shrink-0 shadow-sm z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gradient-to-r after:from-[#F5C200] after:to-[#C9980A]">
          <h2 className="text-3xl font-extrabold text-gray-900 capitalize hidden sm:block">
            {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-8 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-base font-extrabold text-gray-900">{adminName}</p>
              <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-1">Super Admin</p>
            </div>
            <button 
              onClick={() => { logout(); router.push('/auth/login'); }}
              className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm rounded-xl transition-all font-bold text-sm border border-red-100"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
      </div>
      
      {/* Hide the global customer BottomNav on the admin layout completely */}
      <style dangerouslySetInnerHTML={{__html: `
        nav.fixed.bottom-0 { display: none !important; }
      `}} />
    </div>
  );
}
