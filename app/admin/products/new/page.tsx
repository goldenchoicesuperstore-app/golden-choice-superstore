"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../../../lib/firebase/config";
import { CATEGORIES } from "../../../../lib/data/categories";
import { useToast } from "../../../../components/ui/Toast";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().optional(),
  stockQuantity: z.number().min(0, "Stock must be positive"),
  lowStockThreshold: z.number().min(0, "Low stock threshold must be positive"),
  description: z.string().min(1, "Description is required"),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", slug: "", brand: "", category: "", price: 0, compareAtPrice: undefined,
      stockQuantity: 10, lowStockThreshold: 5, imageUrl: "", description: "", isPublished: true, isFeatured: false
    }
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "products"), {
        ...data,
        inStock: data.stockQuantity > 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        reviewCount: 0,
        soldCount: 0
      });
      showToast("Product saved successfully!", "success");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      showToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-500 font-bold">Create a new product listing in the store.</p>
        </div>
        <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Product Name *</label>
            <input 
              {...register("name")} 
              onChange={e => {
                register("name").onChange(e);
                setValue("slug", generateSlug(e.target.value));
              }} 
              type="text" 
              className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
              placeholder="e.g. Premium Wireless Headphones" 
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">URL Slug *</label>
            <input 
              {...register("slug")} 
              type="text" 
              className={`w-full bg-gray-50 border ${errors.slug ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Category *</label>
            <select 
              {...register("category")} 
              className={`w-full bg-gray-50 border ${errors.category ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Brand Name</label>
            <input 
              {...register("brand")} 
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
              placeholder="e.g. Sony" 
            />
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Image URL *</label>
            <input 
              {...register("imageUrl")} 
              type="url" 
              className={`w-full bg-gray-50 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
              placeholder="https://..." 
            />
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <label className="block text-sm font-black text-amber-700 mb-3 uppercase tracking-widest">Regular Price (₦) *</label>
            <input 
              {...register("price", {valueAsNumber: true})} 
              type="number" 
              className={`w-full bg-white border ${errors.price ? 'border-red-500' : 'border-amber-200'} rounded-xl px-5 py-4 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-black text-amber-600 text-lg transition-all`} 
              min="0" 
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Compare at Price (₦)</label>
            <input 
              {...register("compareAtPrice", {valueAsNumber: true})} 
              type="number" 
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 font-bold text-gray-500 text-lg transition-all line-through" 
              min="0" 
              placeholder="Optional original price" 
            />
            {errors.compareAtPrice && <p className="text-red-500 text-sm mt-1">{errors.compareAtPrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Stock Quantity *</label>
            <input 
              {...register("stockQuantity", {valueAsNumber: true})} 
              type="number" 
              className={`w-full bg-gray-50 border ${errors.stockQuantity ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg`} 
              min="0" 
            />
            {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Low Stock Threshold *</label>
            <input 
              {...register("lowStockThreshold", {valueAsNumber: true})} 
              type="number" 
              className={`w-full bg-gray-50 border ${errors.lowStockThreshold ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg`} 
              min="0" 
            />
            {errors.lowStockThreshold && <p className="text-red-500 text-sm mt-1">{errors.lowStockThreshold.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Full Description *</label>
            <textarea 
              {...register("description")} 
              rows={5} 
              className={`w-full bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-gray-900 transition-all leading-relaxed`} 
              placeholder="Detailed product information..."
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
              <input {...register("isPublished")} type="checkbox" className="w-6 h-6 text-amber-500 rounded focus:ring-amber-500" />
              Published (Visible on store)
            </label>
            <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
              <input {...register("isFeatured")} type="checkbox" className="w-6 h-6 text-amber-500 rounded focus:ring-amber-500" />
              Featured Product
            </label>
          </div>
        </div>

        <div className="pt-6 flex justify-end border-t border-gray-100">
          <button type="submit" disabled={saving} className="bg-amber-500 text-white font-extrabold text-lg py-5 px-16 rounded-2xl shadow-lg hover:bg-amber-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-3">
            {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {saving ? "Saving Product..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
