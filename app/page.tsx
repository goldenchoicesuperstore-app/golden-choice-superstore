"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [delay] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("hasSeenSplash") ? 2000 : 6500;
    }
    return 6500;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/categories/hair-products');
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, router]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFE566] to-[#F5C200] flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 text-center mb-6 drop-shadow-sm">
        Welcome to Golden Choice Superstore
      </h1>
      <p className="text-xl md:text-2xl font-medium text-gray-900/90 text-center">
        Your trusted store for everyday essentials
      </p>
    </div>
  );
}
