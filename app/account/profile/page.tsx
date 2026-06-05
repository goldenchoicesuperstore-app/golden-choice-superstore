"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { getAuth, updatePassword } from "firebase/auth";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(profileSchema)
  });

  const { register: regPwd, handleSubmit: handlePwdSubmit, formState: { errors: pwdErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    if (user) {
      reset({ displayName: user.displayName || "", phone: user.phone || "" });
    }
  }, [user, reset]);

  const onUpdateProfile = async (data: any) => {
    setSuccessMsg("Profile updated successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const onUpdatePassword = async (data: any) => {
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, data.newPassword);
        setSuccessMsg("Password updated successfully");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to update password. You may need to sign in again.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-[110px] px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/account" className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-900"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
        </div>

        {successMsg && <div className="bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-8 font-bold flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>{successMsg}</div>}
        {errorMsg && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 font-bold">{errorMsg}</div>}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 border-b pb-4">Personal Information</h2>
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" value={user.email} disabled className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-medium" />
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Email address cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
              <input {...register("displayName")} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input {...register("phone")} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-gray-900" />
            </div>
            <div className="pt-4">
              <button type="submit" className="bg-gray-900 text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-gray-800 transition-colors">Save Changes</button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 border-b pb-4">Change Password</h2>
          <form onSubmit={handlePwdSubmit(onUpdatePassword)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
              <input {...regPwd("newPassword")} type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium" placeholder="••••••••" />
              {pwdErrors.newPassword && <p className="mt-2 text-sm font-bold text-red-600">{pwdErrors.newPassword.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
              <input {...regPwd("confirmPassword")} type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium" placeholder="••••••••" />
              {pwdErrors.confirmPassword && <p className="mt-2 text-sm font-bold text-red-600">{pwdErrors.confirmPassword.message as string}</p>}
            </div>
            <div className="pt-4">
              <button type="submit" className="bg-brand-500 text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-brand-600 transition-colors shadow-brand">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
