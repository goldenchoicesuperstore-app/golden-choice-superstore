"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../lib/auth/AuthContext";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [errorToast, setErrorToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorToast("");
    try {
      await authContext?.signup(data.email, data.password, data.fullName, data.phone);
      router.push("/home");
    } catch (error: any) {
      setErrorToast(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
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
        <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-gray-600 font-medium">
          Join Golden Choice Superstore today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-10 px-6 shadow-xl shadow-brand-500/10 rounded-3xl sm:px-10 border border-brand-100">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-gray-700">Full Name</label>
              <input
                {...register("fullName")}
                type="text"
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm font-medium transition-all"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-sm font-bold text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Email Address</label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm font-medium transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm font-bold text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Phone Number</label>
              <input
                {...register("phone")}
                type="tel"
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm font-medium transition-all"
                placeholder="080XXXXXXXX"
              />
              {errors.phone && <p className="mt-1 text-sm font-bold text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <input
                {...register("password")}
                type="password"
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm font-medium transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm font-bold text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm font-medium transition-all"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm font-bold text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-center pt-2">
              <input
                id="terms"
                {...register("terms")}
                type="checkbox"
                className="h-5 w-5 text-brand-500 focus:ring-brand-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-3 block text-sm font-bold text-gray-600">
                I agree to the <Link href="#" className="text-brand-600 hover:text-brand-500 underline">Terms</Link>
              </label>
            </div>
            {errors.terms && <p className="text-sm font-bold text-red-600">{errors.terms.message}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-brand text-lg font-extrabold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-70 disabled:shadow-none"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-base font-medium">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="text-brand-600 hover:text-brand-500 font-extrabold underline decoration-2 underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
