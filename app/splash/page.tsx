"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    localStorage.setItem("visited", "true");
  }, []);

  const handleShopNow = () => {
    setClicked(true);
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#F5C200] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated shimmer background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      
      <div className="z-10 flex flex-col items-center text-white">
        {/* Star Icon */}
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-white">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 text-center drop-shadow-sm">
          Golden Choice
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-wide mb-8 drop-shadow-sm opacity-90">
          Superstore
        </h2>

        {/* Tagline */}
        <p className="text-lg md:text-xl font-medium mb-12 opacity-95">
          Your One-Stop Shop for Everything
        </p>

        {/* Shop Now Button */}
        <button 
          onClick={handleShopNow}
          className="bg-white text-[#F5C200] font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Shop Now
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}
