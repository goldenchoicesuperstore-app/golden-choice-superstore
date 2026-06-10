"use client";

import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../../components/ui/Toast";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  whatsapp: z.string().min(1, "WhatsApp number is required"),
  address: z.string().min(1, "Address is required"),
  
  freeDeliveryThreshold: z.number().min(0),
  standardDeliveryFee: z.number().min(0),
  expressDeliveryFee: z.number().min(0),
  
  paystackPublicKey: z.string(),
  payOnDeliveryEnabled: z.boolean(),
  
  emailNotifications: z.boolean(),
  whatsappNotifications: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "", email: "", phone: "", whatsapp: "", address: "",
      freeDeliveryThreshold: 0, standardDeliveryFee: 0, expressDeliveryFee: 0,
      paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "", payOnDeliveryEnabled: true,
      emailNotifications: true, whatsappNotifications: true
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const db = getFirestore(app);
        const docRef = doc(db, "settings", "siteConfig");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          reset(docSnap.data() as SettingsFormData);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [reset, showToast]);

  const onSubmit = async (data: SettingsFormData, section: string) => {
    setSavingSection(section);
    try {
      const db = getFirestore(app);
      await setDoc(doc(db, "settings", "siteConfig"), {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast(`${section} settings saved!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save settings", "error");
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return <div className="p-20 text-center font-bold text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Store Settings</h1>
        <p className="text-gray-500 font-bold">Manage configuration for Golden Choice Superstore.</p>
      </div>

      <div className="space-y-10">
        {/* Store Information */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Store Information</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Basic contact and location details.</p>
          </div>
          
          <form onSubmit={handleSubmit((data) => onSubmit(data, "Store Information"))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Store Name</label>
                <input {...register("storeName")} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Email Address</label>
                <input {...register("email")} type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Phone Number</label>
                <input {...register("phone")} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">WhatsApp Number</label>
                <input {...register("whatsapp")} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Physical Address</label>
                <textarea {...register("address")} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-gray-900 transition-all"></textarea>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={savingSection === "Store Information"} className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {savingSection === "Store Information" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Store Info
              </button>
            </div>
          </form>
        </section>

        {/* Delivery Settings */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Delivery Settings</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Configure shipping rules and fees.</p>
          </div>
          
          <form onSubmit={handleSubmit((data) => onSubmit(data, "Delivery"))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Free Delivery Threshold (₦)</label>
                <input {...register("freeDeliveryThreshold", {valueAsNumber: true})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-brand-600 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Standard Fee (₦)</label>
                <input {...register("standardDeliveryFee", {valueAsNumber: true})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Express Fee (₦)</label>
                <input {...register("expressDeliveryFee", {valueAsNumber: true})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={savingSection === "Delivery"} className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {savingSection === "Delivery" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Delivery Settings
              </button>
            </div>
          </form>
        </section>

        {/* Payment Settings */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Payment Settings</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage payment methods and API keys.</p>
          </div>
          
          <form onSubmit={handleSubmit((data) => onSubmit(data, "Payment"))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Paystack Public Key</label>
                <input {...register("paystackPublicKey")} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-mono text-sm text-gray-900 transition-all" />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer text-gray-900 font-bold p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input {...register("payOnDeliveryEnabled")} type="checkbox" className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500" />
                  Enable Pay on Delivery (POD)
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={savingSection === "Payment"} className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {savingSection === "Payment" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Payment Settings
              </button>
            </div>
          </form>
        </section>

        {/* Notification Settings */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Notification Settings</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Configure admin alerts for new orders.</p>
          </div>
          
          <form onSubmit={handleSubmit((data) => onSubmit(data, "Notification"))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer text-gray-900 font-bold p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input {...register("emailNotifications")} type="checkbox" className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500" />
                  Email Notifications
                </label>
              </div>
              
              <div>
                <label className="flex items-center gap-3 cursor-pointer text-gray-900 font-bold p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input {...register("whatsappNotifications")} type="checkbox" className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500" />
                  WhatsApp Notifications
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={savingSection === "Notification"} className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {savingSection === "Notification" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Notification Settings
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
