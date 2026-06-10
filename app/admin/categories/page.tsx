"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../../components/ui/Toast";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  icon: z.string().min(1, "Icon is required"),
  orderNumber: z.number().int().min(0),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDoc extends CategoryFormData {
  id: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "", slug: "", description: "", imageUrl: "", icon: "📦", orderNumber: 0, isActive: true
    }
  });

  const fetchCategories = async () => {
    try {
      const db = getFirestore(app);
      const q = query(collection(db, "categories"), orderBy("orderNumber", "asc"));
      const querySnapshot = await getDocs(q);
      const cats: CategoryDoc[] = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as CategoryDoc);
      });
      setCategories(cats);
    } catch (err) {
      console.error(err);
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSaving(true);
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "categories"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast("Category added successfully!", "success");
      setIsModalOpen(false);
      reset();
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast("Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const db = getFirestore(app);
      await updateDoc(doc(db, "categories", id), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      setCategories(categories.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      showToast("Category status updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-500 font-bold">Manage product categories for your store.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-sm"
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold">Loading categories...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm">Icon</th>
                <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm">Name</th>
                <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm">Slug</th>
                <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm text-right">Active</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-5 text-2xl">{category.icon}</td>
                  <td className="p-5 font-bold text-gray-900">{category.name}</td>
                  <td className="p-5 font-medium text-gray-500">{category.slug}</td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => toggleActive(category.id, category.isActive ?? true)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${category.isActive !== false ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${category.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500 font-bold">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-[2rem]">
              <h2 className="text-2xl font-extrabold text-gray-900">Add New Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Name *</label>
                  <input 
                    {...register("name")} 
                    onChange={e => {
                      register("name").onChange(e);
                      setValue("slug", generateSlug(e.target.value));
                    }} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Slug *</label>
                  <input 
                    {...register("slug")} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
                  />
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Icon (Emoji) *</label>
                  <input 
                    {...register("icon")} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-2xl transition-all" 
                  />
                  {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Description</label>
                  <textarea 
                    {...register("description")} 
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium text-gray-900 transition-all" 
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Image URL</label>
                  <input 
                    {...register("imageUrl")} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
                  />
                  {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Order Number</label>
                  <input 
                    {...register("orderNumber", {valueAsNumber: true})} 
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-gray-900 transition-all" 
                  />
                </div>

                <div className="flex items-center mt-8">
                  <label className="flex items-center gap-3 cursor-pointer text-gray-900 font-bold">
                    <input {...register("isActive")} type="checkbox" className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500" />
                    Active Category
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
