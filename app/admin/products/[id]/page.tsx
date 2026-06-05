"use client";

import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../../../lib/firebase/config";
import { CATEGORIES } from "../../../../lib/data/categories";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset } = useForm();

  useEffect(() => {
    const fetchProduct = async () => {
      const db = getFirestore(app);
      const docSnap = await getDoc(doc(db, "products", id));
      if (docSnap.exists()) {
        reset(docSnap.data());
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, reset]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const db = getFirestore(app);
      await updateDoc(doc(db, "products", id), {
        ...data,
        price: Number(data.price),
        compareAtPrice: Number(data.compareAtPrice),
        stockQuantity: Number(data.stockQuantity),
        inStock: Number(data.stockQuantity) > 0,
        updatedAt: serverTimestamp()
      });
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center font-bold text-gray-500">Loading product...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Edit Product</h1>
          <p className="text-gray-500 font-bold">Update product details and inventory.</p>
        </div>
        <button onClick={() => router.back()} className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Product Name *</label>
            <input {...register("name")} onChange={e => {
              register("name").onChange(e);
              setValue("slug", generateSlug(e.target.value));
            }} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" required />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">URL Slug *</label>
            <input {...register("slug")} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" required />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Category *</label>
            <select {...register("category")} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" required>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Brand Name *</label>
            <input {...register("brand")} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" required />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Image URL *</label>
            <input {...register("imageUrl")} type="url" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" required />
          </div>

          <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100">
            <label className="block text-sm font-black text-brand-700 mb-3 uppercase tracking-widest">Regular Price (₦) *</label>
            <input {...register("price", {valueAsNumber: true})} type="number" className="w-full bg-white border border-brand-200 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-black text-brand-600 text-lg transition-all" required min="0" />
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Compare at Price (₦)</label>
            <input {...register("compareAtPrice", {valueAsNumber: true})} type="number" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 font-bold text-gray-500 text-lg transition-all line-through" min="0" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Stock Quantity *</label>
            <input {...register("stockQuantity", {valueAsNumber: true})} type="number" className="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg" required min="0" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Full Description</label>
            <textarea {...register("description")} rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-gray-900 transition-all leading-relaxed"></textarea>
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
              <input {...register("isPublished")} type="checkbox" className="w-6 h-6 text-brand-500 rounded focus:ring-brand-500" />
              Published (Visible on store)
            </label>
            <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
              <input {...register("isFeatured")} type="checkbox" className="w-6 h-6 text-brand-500 rounded focus:ring-brand-500" />
              Featured Product
            </label>
          </div>
        </div>

        <div className="pt-6 flex justify-end border-t border-gray-100">
          <button type="submit" disabled={saving} className="bg-brand-500 text-white font-extrabold text-lg py-5 px-16 rounded-2xl shadow-brand hover:bg-brand-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-3">
            {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {saving ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
