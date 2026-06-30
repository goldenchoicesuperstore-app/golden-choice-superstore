"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../../../lib/firebase/config";
import { useToast } from "../../../../components/ui/Toast";
import { Product } from "../../../../types";
import PexelsSearch from "./PexelsSearch";

const categories = [
  { name: "Hair Products", slug: "hair-products" },
  { name: "Electronics", slug: "electronics" },
  { name: "Baby Products", slug: "baby-products" },
  { name: "Insecticides", slug: "insecticides" },
  { name: "Perfumes & Sprays", slug: "perfumes-sprays" },
  { name: "Phones", slug: "phones" },
  { name: "Laptops & Accessories", slug: "laptops-accessories" },
  { name: "Beddings", slug: "beddings" },
  { name: "Drinks", slug: "drinks" },
  { name: "Bags", slug: "bags" },
  { name: "Shoes", slug: "shoes" },
  { name: "Food and Beverages", slug: "food-and-beverages" },
  { name: "Wristwatches", slug: "wristwatches" }
];

const productSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(1, "Price must be at least 1"),
  compareAtPrice: z.number().nullable().optional(),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  stockQuantity: z.number().min(0, "Stock Quantity must be 0 or more"),
  lowStockThreshold: z.number().min(0),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm({ initialData, productId }: { initialData?: Partial<Product> | null, productId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "", category: "", brand: "", description: "", price: 0, compareAtPrice: null,
      imageUrl: "", stockQuantity: 10, lowStockThreshold: 10, isPublished: true, isFeatured: false
    }
  });

  const imageUrl = watch("imageUrl");

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const db = getFirestore(app);
      const slug = generateSlug(data.name);
      
      const productPayload = {
        name: data.name,
        slug,
        category: data.category,
        brand: data.brand || "",
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        imageUrl: data.imageUrl,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        inStock: data.stockQuantity > 0,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        updatedAt: serverTimestamp(),
      };

      if (productId) {
        await updateDoc(doc(db, "products", productId), productPayload);
        showToast("Product updated successfully", "success");
      } else {
        await addDoc(collection(db, "products"), {
          ...productPayload,
          rating: 0,
          reviewCount: 0,
          soldCount: 0,
          createdAt: serverTimestamp(),
        });
        showToast("Product saved successfully", "success");
      }
      
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
      
    } catch (err) {
      console.error(err);
      showToast(productId ? "Failed to update product" : "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Product Name *</label>
          <input 
            {...register("name")} 
            type="text" 
            className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Category *</label>
          <select 
            {...register("category")} 
            className={`w-full bg-gray-50 border ${errors.category ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`}
          >
            <option value="">Select a category</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Brand</label>
          <input 
            {...register("brand")} 
            type="text" 
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Description *</label>
          <textarea 
            {...register("description")} 
            rows={5} 
            className={`w-full bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-gray-900 transition-all leading-relaxed`} 
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Price */}
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <label className="block text-sm font-black text-amber-700 mb-3 uppercase tracking-widest">Price in Naira *</label>
          <input 
            {...register("price", {valueAsNumber: true})} 
            type="number" 
            className={`w-full bg-white border ${errors.price ? 'border-red-500' : 'border-amber-200'} rounded-xl px-5 py-4 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-black text-amber-600 text-lg transition-all`} 
            min="1" 
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>

        {/* Compare Price */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Compare Price in Naira</label>
          <input 
            {...register("compareAtPrice", {valueAsNumber: true})} 
            type="number" 
            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 font-bold text-gray-500 text-lg transition-all" 
            min="0" 
          />
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Image URL *</label>
          <input 
            {...register("imageUrl")} 
            onChange={(e) => {
              register("imageUrl").onChange(e);
              setImgError(false);
            }}
            type="url" 
            className={`w-full bg-gray-50 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
            placeholder="https://..." 
          />
          {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
          
          <PexelsSearch 
            onSelect={(url) => {
              setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true });
              setImgError(false);
            }} 
          />

          {/* Image Preview */}
          <div className="mt-4 border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-[200px] w-full max-w-md">
            {imageUrl && !imgError ? (
              <img 
                src={imageUrl} 
                alt="Product Preview" 
                className="max-h-[300px] object-contain"
                onError={() => setImgError(true)}
              />
            ) : imgError ? (
              <p className="text-red-500 font-bold">Invalid image URL</p>
            ) : (
              <p className="text-gray-400 font-medium">Image Preview</p>
            )}
          </div>
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Stock Quantity *</label>
          <input 
            {...register("stockQuantity", {valueAsNumber: true})} 
            type="number" 
            className={`w-full bg-gray-50 border ${errors.stockQuantity ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg`} 
          />
          {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</p>}
        </div>

        {/* Low Stock Threshold */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Low Stock Threshold</label>
          <input 
            {...register("lowStockThreshold", {valueAsNumber: true})} 
            type="number" 
            className={`w-full bg-gray-50 border ${errors.lowStockThreshold ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg`} 
          />
          {errors.lowStockThreshold && <p className="text-red-500 text-sm mt-1">{errors.lowStockThreshold.message}</p>}
        </div>

        {/* Toggles */}
        <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
            <input {...register("isPublished")} type="checkbox" className="w-6 h-6 text-amber-500 rounded focus:ring-amber-500" />
            Is Published (Visible on store)
          </label>
          <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
            <input {...register("isFeatured")} type="checkbox" className="w-6 h-6 text-amber-500 rounded focus:ring-amber-500" />
            Is Featured
          </label>
        </div>
      </div>

      <div className="pt-6 flex justify-end border-t border-gray-100">
        <button type="submit" disabled={saving} className="bg-gradient-to-r from-brand-500 to-[#C9980A] text-white font-extrabold text-xl py-5 px-16 rounded-2xl hover:shadow-brand hover:scale-[1.02] transition-all disabled:opacity-50 disabled:shadow-none border-none flex items-center gap-3">
          {saving && <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>}
          {saving ? "Saving..." : (productId ? "Update Product" : "Save Product")}
        </button>
      </div>
    </form>
  );
}
