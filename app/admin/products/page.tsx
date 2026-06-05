"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { Product } from "../../../types";
import { CATEGORIES } from "../../../lib/data/categories";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const router = useRouter();
  const db = getFirestore(app);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.length} products?`)) {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.delete(doc(db, "products", id));
      });
      await batch.commit();
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredProducts.map(p => p.id));
    else setSelectedIds([]);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-8rem)]">
      {/* Toolbar */}
      <div className="p-8 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-gray-50/30">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold w-full focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-sm w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 font-extrabold text-sm px-6 py-3.5 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <Link href="/admin/products/new" className="bg-brand-500 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-brand hover:bg-brand-600 transition-all w-full xl:w-auto text-center flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
              <th className="p-6 pl-8 w-12">
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} className="w-5 h-5 text-brand-500 rounded border-gray-300 focus:ring-brand-500" />
              </th>
              <th className="p-6">Product Details</th>
              <th className="p-6">Category</th>
              <th className="p-6">Price</th>
              <th className="p-6">Stock</th>
              <th className="p-6">Status</th>
              <th className="p-6 pr-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-16 text-center text-gray-400 font-bold text-lg">Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={7} className="p-16 text-center text-gray-400 font-bold text-lg">No products found matching your search.</td></tr>
            ) : filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-6 pl-8">
                  <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 text-brand-500 rounded border-gray-300 focus:ring-brand-500" />
                </td>
                <td className="p-6 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm p-2">
                    <img src={product.imageUrl || "https://placehold.co/100"} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 line-clamp-1 max-w-[250px] text-base">{product.name}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{product.brand}</p>
                  </div>
                </td>
                <td className="p-6 font-bold text-gray-600 capitalize text-sm">{product.category.replace("-", " ")}</td>
                <td className="p-6 font-black text-brand-600 text-lg">₦{product.price.toLocaleString()}</td>
                <td className="p-6">
                  <span className={`font-black text-base px-3 py-1 rounded-lg ${product.stockQuantity < 10 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${product.isPublished ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-6 pr-8 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => router.push(`/admin/products/${product.id}`)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-blue-100">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
