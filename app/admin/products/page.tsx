"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { useToast } from "../../../components/ui/Toast";
import { Product } from "../../../types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error(error);
      showToast("Failed to load products", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const db = getFirestore(app);
        await deleteDoc(doc(db, "products", id));
        showToast("Product deleted successfully", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete product", "error");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Products ({products.length})</h1>
          <p className="text-gray-500 font-bold">Manage all products in your store.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="px-6 py-3 bg-[#FFD700] text-gray-900 font-extrabold rounded-xl hover:bg-[#F4CE00] transition-all shadow-sm flex items-center gap-2"
        >
          Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm">Image</th>
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm">Product Name</th>
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm">Category</th>
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm text-right">Price</th>
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm text-center">Stock</th>
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm text-center">Status</th>
                  <th className="p-5 font-black text-gray-700 uppercase tracking-widest text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5">
                      <div className="w-[50px] h-[50px] bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="gray"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-5 font-bold text-gray-900">{product.name}</td>
                    <td className="p-5 font-medium text-gray-500 capitalize">{product.category?.replace('-', ' ') || 'Uncategorized'}</td>
                    <td className="p-5 font-black text-brand-600 text-right">₦{product.price.toLocaleString()}</td>
                    <td className="p-5 text-center font-bold text-gray-700">{product.stockQuantity}</td>
                    <td className="p-5 text-center">
                      {product.isPublished ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700 uppercase tracking-wider">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-700 uppercase tracking-wider">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right space-x-3">
                      <Link 
                        href={`/admin/products/${product.id}`}
                        className="text-brand-500 font-bold hover:text-brand-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 font-bold hover:text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-500 font-bold">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
