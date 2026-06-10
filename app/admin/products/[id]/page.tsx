"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../../../lib/firebase/config";
import ProductForm from "../components/ProductForm";
import { useToast } from "../../../../components/ui/Toast";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const db = getFirestore(app);
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInitialData(docSnap.data());
        } else {
          showToast("Product not found", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, showToast]);

  if (loading) {
    return <div className="p-20 text-center font-bold text-gray-500">Loading product data...</div>;
  }

  if (!initialData) {
    return <div className="p-20 text-center font-bold text-red-500">Product not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Edit Product</h1>
          <p className="text-gray-500 font-bold">Update product details for your store.</p>
        </div>
      </div>
      <ProductForm initialData={initialData} productId={productId} />
    </div>
  );
}
