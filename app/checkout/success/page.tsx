"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    setRef(searchParams.get("ref"));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 px-4 flex flex-col items-center justify-center">
      <div className="w-28 h-28 bg-brand-100 rounded-full flex items-center justify-center mb-8 text-brand-500 animate-[bounce_1s_ease-in-out] shadow-sm border-[6px] border-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-14 h-14">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 text-center tracking-tight">Order Placed Successfully!</h1>
      <p className="text-gray-500 font-medium mb-10 text-center text-lg">Thank you for shopping with Golden Choice Superstore.</p>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 w-full max-w-lg mb-10 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6 border-b border-gray-100 pb-6">
          <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Order Reference</span>
          <span className="font-extrabold text-gray-900 text-lg bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{ref || "GCS-PENDING"}</span>
        </div>
        <div>
          <span className="text-gray-400 font-black text-xs uppercase tracking-widest block mb-2">Estimated Delivery</span>
          <span className="font-black text-brand-500 text-2xl bg-brand-50 inline-block px-4 py-2 rounded-xl">2 - 4 Business Days</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <Link href="/profile/orders" className="flex-1 bg-gray-900 text-white font-bold py-4 text-center rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-lg">
          Track My Order
        </Link>
        <Link href="/home" className="flex-1 bg-white text-brand-600 border-2 border-brand-500 font-bold py-4 text-center rounded-xl hover:bg-brand-50 transition-colors text-lg">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
