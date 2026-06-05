"use client";

import { useState } from "react";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import Link from "next/link";

export default function OrdersPage() {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("All");

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = ["All", "Pending", "Delivered", "Cancelled"];

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-[110px] px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-900"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-8">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all border-2 ${activeTab === tab ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-transparent hover:border-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order List / Empty State */}
        {activeTab === "All" ? (
          <div className="space-y-6">
            {/* Mock Order Card for presentation */}
            <details className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
              <summary className="p-6 cursor-pointer list-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-gray-900 text-lg">GCS-1701348</span>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Pending</span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold">Placed on 24 May 2026</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border-2 border-white overflow-hidden shadow-sm"><img src="https://placehold.co/100" className="w-full h-full object-cover mix-blend-multiply" alt="item" /></div>
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border-2 border-white overflow-hidden flex items-center justify-center text-xs font-black text-gray-600 shadow-sm">+2</div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-600 text-2xl">₦45,000</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-open:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-900 group-open:rotate-180 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  </div>
                </div>
              </summary>
              
              {/* Expanded details */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <h4 className="font-extrabold text-gray-900 mb-4 text-sm uppercase tracking-widest">Order Items</h4>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src="https://placehold.co/100" className="w-14 h-14 rounded-xl bg-gray-50 object-cover" alt="item" />
                      <div>
                        <p className="font-bold text-gray-900 text-base">Premium Wireless Headphones</p>
                        <p className="text-sm font-semibold text-gray-500 mt-1">Qty: 1</p>
                      </div>
                    </div>
                    <span className="font-black text-brand-500 text-lg">₦25,000</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest block mb-2">Delivery Address</span>
                    <p className="font-bold text-gray-900 text-base mb-1">{user.displayName || "User"}</p>
                    <p className="text-gray-600 font-medium">12 Awolowo Road, Ikoyi<br/>Lagos</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest block mb-2">Payment Method</span>
                    <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                      Paystack (Card)
                    </p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6">📦</div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No {activeTab.toLowerCase()} orders</h3>
            <p className="text-gray-500 font-medium text-lg">You don't have any orders with this status right now.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
