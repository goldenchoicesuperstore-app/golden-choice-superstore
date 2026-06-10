"use client";

import ProductForm from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-500 font-bold">Create a new product listing in the store.</p>
        </div>
      </div>
      <ProductForm />
    </div>
  );
}
