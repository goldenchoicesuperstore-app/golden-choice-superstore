"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hasVisited = localStorage.getItem("visited");
    if (!hasVisited) {
      router.replace("/splash");
    } else {
      router.replace("/home");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-[#F5C200] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
