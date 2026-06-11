"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    sessionStorage.setItem("hasSeenSplash", "true");

    const fadeOutTimer = setTimeout(() => {
      setIsFading(true);
    }, 4000);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-[280px] h-[150px] flex items-center justify-center animate-[splash-scale_4s_ease-out_forwards]">
        {imgError ? (
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F5C200] to-[#C9980A] text-center animate-[splash-fade_0.8s_ease-out_forwards]">
            Golden Choice Superstore
          </h1>
        ) : (
          <img
            src="https://i.postimg.cc/tJGRgvnY/golden-choice-oval-with-tagline.png"
            alt="Golden Choice Superstore"
            className="w-full h-full object-contain animate-[splash-fade_0.8s_ease-out_forwards]"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}
