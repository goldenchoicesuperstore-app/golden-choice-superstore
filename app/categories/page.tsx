"use client";

import Link from "next/link";
import { CATEGORIES } from "../../lib/data/categories";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          All Categories
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map(category => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-brand transition-all flex flex-col items-center justify-center text-center group"
            >
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
