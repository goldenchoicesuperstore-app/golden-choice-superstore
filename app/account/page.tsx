"use client";

import Link from "next/link";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useContext } from "react";
import { AuthContext } from "../../lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, loading } = useRequireAuth();
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const firstName = user.displayName?.split(" ")[0] || "User";

  const handleLogout = async () => {
    await authContext?.logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-[110px] px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Hello, {firstName}! 👋</h1>
          <p className="text-gray-500 font-medium text-lg">Manage your account and view orders.</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-brand-200 transition-colors">
            <span className="text-3xl md:text-4xl font-black text-brand-500 mb-2">0</span>
            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Total Orders</span>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-brand-200 transition-colors">
            <span className="text-2xl md:text-3xl font-black text-brand-500 mb-2">₦0</span>
            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Total Spent</span>
          </div>
          <div className="bg-gradient-to-br from-brand-500 to-brand-400 p-5 rounded-3xl shadow-brand flex flex-col items-center justify-center text-center text-white">
            <span className="text-3xl md:text-4xl font-black mb-2">{user.loyaltyPoints || 0}</span>
            <span className="text-[10px] md:text-xs font-black text-brand-100 uppercase tracking-widest">Loyalty Pts</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href="/account/orders" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:border-brand-500 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors group-hover:rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
            </div>
            <span className="font-extrabold text-gray-800 text-sm">My Orders</span>
          </Link>
          
          <Link href="/account/profile" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:border-brand-500 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors group-hover:-rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
            </div>
            <span className="font-extrabold text-gray-800 text-sm">My Profile</span>
          </Link>

          <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:border-brand-500 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors group-hover:rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
            </div>
            <span className="font-extrabold text-gray-800 text-sm">My Addresses</span>
          </button>

          <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:border-brand-500 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors group-hover:-rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
            </div>
            <span className="font-extrabold text-gray-800 text-sm">Chat Support</span>
          </button>
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-extrabold text-gray-900">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm font-bold text-brand-600 hover:text-brand-500 uppercase tracking-widest">View All</Link>
          </div>
          <div className="p-12 text-center text-gray-500 font-medium">
            <span className="text-4xl block mb-4">🛒</span>
            You don't have any recent orders.
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-white border-2 border-red-100 text-red-500 font-bold text-lg py-4 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
