"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../../../lib/firebase/config";
import { useToast } from "../../../../components/ui/Toast";

const categories = [
  { name: "Hair Products", slug: "hair-products" },
  { name: "Electronics", slug: "electronics" },
  { name: "Baby Products", slug: "baby-products" },
  { name: "Insecticides", slug: "insecticides" },
  { name: "Perfumes & Sprays", slug: "perfumes-sprays" },
  { name: "Phones", slug: "phones" },
  { name: "Laptops & Accessories", slug: "laptops-accessories" },
  { name: "Beddings", slug: "beddings" },
  { name: "Drinks", slug: "drinks" }
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

const bulkSchema = z.object({
  products: z.array(productSchema).min(1, "At least one product is required")
});

type BulkFormData = z.infer<typeof bulkSchema>;

export default function BulkAddProductsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<BulkFormData>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      products: [{
        name: "", category: "", brand: "", description: "", price: 0, compareAtPrice: null,
        imageUrl: "", stockQuantity: 10, lowStockThreshold: 10, isPublished: true, isFeatured: false
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });

  const watchProducts = watch("products");

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const onSubmit = async (data: BulkFormData) => {
    setSaving(true);
    try {
      const db = getFirestore(app);
      
      const promises = data.products.map(productData => {
        const slug = generateSlug(productData.name);
        return addDoc(collection(db, "products"), {
          name: productData.name,
          slug,
          category: productData.category,
          brand: productData.brand || "",
          description: productData.description,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice || null,
          imageUrl: productData.imageUrl,
          stockQuantity: productData.stockQuantity,
          lowStockThreshold: productData.lowStockThreshold,
          inStock: productData.stockQuantity > 0,
          isPublished: productData.isPublished,
          isFeatured: productData.isFeatured,
          rating: 0,
          reviewCount: 0,
          soldCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(promises);
      showToast(`Successfully saved ${data.products.length} products`, "success");
      
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
      
    } catch (err) {
      console.error(err);
      showToast("Failed to save products", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Add Multiple Products</h1>
        <p className="text-gray-500 font-bold">Add several products to your store at once.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {fields.map((field, index) => {
          const productErrors = errors.products?.[index];
          const currentImageUrl = watchProducts[index]?.imageUrl;

          return (
            <div key={field.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 space-y-10 relative">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-xl font-black text-gray-900">Product #{index + 1}</h2>
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="text-red-500 font-bold hover:text-red-600 flex items-center gap-1"
                  >
                    Remove Product
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Product Name *</label>
                  <input 
                    {...register(`products.${index}.name` as const)} 
                    type="text" 
                    className={`w-full bg-gray-50 border ${productErrors?.name ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
                  />
                  {productErrors?.name && <p className="text-red-500 text-sm mt-1">{productErrors.name.message}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Category *</label>
                  <select 
                    {...register(`products.${index}.category` as const)} 
                    className={`w-full bg-gray-50 border ${productErrors?.category ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                  {productErrors?.category && <p className="text-red-500 text-sm mt-1">{productErrors.category.message}</p>}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Brand</label>
                  <input 
                    {...register(`products.${index}.brand` as const)} 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Description *</label>
                  <textarea 
                    {...register(`products.${index}.description` as const)} 
                    rows={3} 
                    className={`w-full bg-gray-50 border ${productErrors?.description ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-gray-900 transition-all leading-relaxed`} 
                  ></textarea>
                  {productErrors?.description && <p className="text-red-500 text-sm mt-1">{productErrors.description.message}</p>}
                </div>

                {/* Price */}
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <label className="block text-sm font-black text-amber-700 mb-3 uppercase tracking-widest">Price in Naira *</label>
                  <input 
                    {...register(`products.${index}.price` as const, {valueAsNumber: true})} 
                    type="number" 
                    className={`w-full bg-white border ${productErrors?.price ? 'border-red-500' : 'border-amber-200'} rounded-xl px-5 py-4 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-black text-amber-600 text-lg transition-all`} 
                    min="1" 
                  />
                  {productErrors?.price && <p className="text-red-500 text-sm mt-1">{productErrors.price.message}</p>}
                </div>

                {/* Compare Price */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Compare Price in Naira</label>
                  <input 
                    {...register(`products.${index}.compareAtPrice` as const, {valueAsNumber: true})} 
                    type="number" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 font-bold text-gray-500 text-lg transition-all" 
                    min="0" 
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Image URL *</label>
                  <input 
                    {...register(`products.${index}.imageUrl` as const)} 
                    type="url" 
                    className={`w-full bg-gray-50 border ${productErrors?.imageUrl ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all`} 
                    placeholder="https://..." 
                  />
                  {productErrors?.imageUrl && <p className="text-red-500 text-sm mt-1">{productErrors.imageUrl.message}</p>}
                  
                  {/* Image Preview */}
                  <div className="mt-4 border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-[150px] w-full max-w-sm">
                    {currentImageUrl ? (
                      <img 
                        src={currentImageUrl} 
                        alt="Preview" 
                        className="max-h-[150px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                        }}
                      />
                    ) : (
                      <p className="text-gray-400 font-medium text-sm">Image Preview</p>
                    )}
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Stock Quantity *</label>
                  <input 
                    {...register(`products.${index}.stockQuantity` as const, {valueAsNumber: true})} 
                    type="number" 
                    className={`w-full bg-gray-50 border ${productErrors?.stockQuantity ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg`} 
                  />
                  {productErrors?.stockQuantity && <p className="text-red-500 text-sm mt-1">{productErrors.stockQuantity.message}</p>}
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Low Stock Threshold</label>
                  <input 
                    {...register(`products.${index}.lowStockThreshold` as const, {valueAsNumber: true})} 
                    type="number" 
                    className={`w-full bg-gray-50 border ${productErrors?.lowStockThreshold ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-black text-gray-900 transition-all text-lg`} 
                  />
                  {productErrors?.lowStockThreshold && <p className="text-red-500 text-sm mt-1">{productErrors.lowStockThreshold.message}</p>}
                </div>

                {/* Toggles */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
                    <input {...register(`products.${index}.isPublished` as const)} type="checkbox" className="w-6 h-6 text-amber-500 rounded focus:ring-amber-500" />
                    Is Published (Visible on store)
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer text-gray-900 font-extrabold text-base bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 w-full">
                    <input {...register(`products.${index}.isFeatured` as const)} type="checkbox" className="w-6 h-6 text-amber-500 rounded focus:ring-amber-500" />
                    Is Featured
                  </label>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-center pt-4">
          <button 
            type="button" 
            onClick={() => append({
              name: "", category: "", brand: "", description: "", price: 0, compareAtPrice: null,
              imageUrl: "", stockQuantity: 10, lowStockThreshold: 10, isPublished: true, isFeatured: false
            })}
            className="px-8 py-4 bg-gray-100 text-gray-900 font-extrabold rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2 border border-gray-200 shadow-sm"
          >
            <span className="text-xl">+</span> Add Another Product
          </button>
        </div>

        <div className="sticky bottom-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex justify-between items-center z-10">
          <div>
            <p className="font-extrabold text-gray-900">Total Products: {fields.length}</p>
          </div>
          <button 
            type="submit" 
            disabled={saving} 
            className="bg-gradient-to-r from-[#F5C200] to-[#C9980A] text-gray-900 font-black text-xl py-5 px-16 rounded-2xl hover:shadow-[0_0_20px_rgba(245,194,0,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:shadow-none border-none flex items-center gap-3"
          >
            {saving && <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>}
            {saving ? "Saving..." : "Save All Products"}
          </button>
        </div>
      </form>
    </div>
  );
}
