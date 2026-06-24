"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../lib/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [errorToast, setErrorToast] = useState("");

  const handleGoogleSignIn = async () => {
    setErrorToast("");
    try {
      await authContext?.loginWithGoogle();
      router.push("/");
    } catch (error: any) {
      setErrorToast(error.message || "Failed to login with Google");
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {errorToast && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg font-bold z-50">
          {errorToast}
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center text-brand-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-gray-600 font-medium">
          Sign in to your Golden Choice account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-10 px-6 shadow-xl shadow-brand-500/10 rounded-3xl sm:px-10 border border-brand-100">
          <div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-base font-extrabold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google logo" />
              Sign in with Google
            </button>
          </div>
          
          <div className="mt-10 text-center text-base font-medium">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/register" className="text-brand-600 hover:text-brand-500 font-extrabold underline decoration-2 underline-offset-4">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
